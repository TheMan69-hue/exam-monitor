do $$
declare
  v_student uuid := (select id from public.profiles where role = 'student' order by created_at limit 1);
  v_teacher uuid := (select id from public.profiles where role = 'teacher' order by created_at limit 1);
  v_active uuid;
  v_scheduled uuid;
  v_incident uuid;
  v_res jsonb;
  v_n integer;
  v_status text;
  v_role text;
  v_out text := '';
begin
  if v_student is null or v_teacher is null then
    raise exception 'SETUP PROBLEM: you need at least one student and one teacher account.';
  end if;

  -- Test data, created as the database owner (all of it is rolled back at the end).
  insert into public.exams (teacher_id, title, duration_minutes, status)
  values (v_teacher, 'TEST active exam', 30, 'active') returning id into v_active;
  insert into public.exams (teacher_id, title, duration_minutes, status)
  values (v_teacher, 'TEST scheduled exam', 30, 'scheduled') returning id into v_scheduled;
  insert into public.incidents (exam_id, student_id, student_name, type, source, details, detected_at)
  values (v_active, v_student, 'Test Student', 'head_turn', 'simulated',
          '{"occurrences":4,"windowSeconds":60}', now() - interval '1 day')
  returning id into v_incident;

  ----------------------------------------------------------------
  -- STUDENT
  ----------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  set local role authenticated;

    -- 1 (Check A) a student cannot change their own role
  begin
    update public.profiles set role = 'teacher' where id = v_student;
    get diagnostics v_n = row_count;
    v_out := v_out || E'\n' || case when v_n = 0 then 'PASS' else 'FAIL' end
      || ' 1a role update attempt changed ' || v_n
      || ' rows (expected 0, or a permission error)';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 1a role update was blocked by a permission error';
  end;

  -- 1b the role must still be "student" afterwards
  select role into v_role from public.profiles where id = v_student;
  v_out := v_out || E'\n' || case when v_role = 'student' then 'PASS' else 'FAIL' end
    || ' 1b student role afterwards is: ' || coalesce(v_role, 'unreadable');

  -- 2 a student cannot read incidents
  select count(*) into v_n from public.incidents;
  v_out := v_out || E'\n' || case when v_n = 0 then 'PASS' else 'FAIL' end
    || ' 2 student sees ' || v_n || ' incidents (expected 0)';

  -- 3 a student cannot update incidents
  update public.incidents set status = 'dismissed' where id = v_incident;
  get diagnostics v_n = row_count;
  v_out := v_out || E'\n' || case when v_n = 0 then 'PASS' else 'FAIL' end
    || ' 3 student updated ' || v_n || ' incidents (expected 0)';

  -- 4 a student cannot delete incidents
  begin
    delete from public.incidents where id = v_incident;
    v_out := v_out || E'\nFAIL 4 student could run a delete on incidents';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 4 student cannot delete incidents';
  end;

  -- 5 a student cannot insert incidents directly (even forged "model" ones)
  begin
    insert into public.incidents (exam_id, student_id, student_name, type, source, details)
    values (v_active, v_student, 'Forged', 'head_turn', 'model', '{}');
    v_out := v_out || E'\nFAIL 5 student could insert an incident directly';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 5 student cannot insert incidents directly';
  end;

  -- 6 report_incident works for a student on an active exam
  v_res := public.report_incident(v_active, 'head_turn',
    '{"occurrences":5,"windowSeconds":60,"direction":"left","maxYawDegrees":38}'::jsonb);
  v_out := v_out || E'\n' || case when (v_res ->> 'ok')::boolean then 'PASS' else 'FAIL' end
    || ' 6 student report: ' || (v_res ->> 'message');

  -- 7 the 2-minute cooldown blocks an immediate second report
  v_res := public.report_incident(v_active, 'head_turn',
    '{"occurrences":5,"windowSeconds":60}'::jsonb);
  v_out := v_out || E'\n'
    || case when not (v_res ->> 'ok')::boolean and (v_res ->> 'message') ilike '%cooldown%'
            then 'PASS' else 'FAIL' end
    || ' 7 second report: ' || (v_res ->> 'message');

  -- 8 reporting on a scheduled (inactive) exam is rejected
  v_res := public.report_incident(v_scheduled, 'head_turn',
    '{"occurrences":5,"windowSeconds":60}'::jsonb);
  v_out := v_out || E'\n'
    || case when not (v_res ->> 'ok')::boolean and (v_res ->> 'message') ilike '%not active%'
            then 'PASS' else 'FAIL' end
    || ' 8 inactive exam: ' || (v_res ->> 'message');

  -- 9 an invalid incident type is rejected
  v_res := public.report_incident(v_active, 'cheating',
    '{"occurrences":5,"windowSeconds":60}'::jsonb);
  v_out := v_out || E'\n'
    || case when not (v_res ->> 'ok')::boolean then 'PASS' else 'FAIL' end
    || ' 9 invalid type: ' || (v_res ->> 'message');

  -- 10 a student cannot create an exam
  begin
    insert into public.exams (teacher_id, title, duration_minutes)
    values (v_student, 'Student exam', 30);
    v_out := v_out || E'\nFAIL 10 student created an exam';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 10 student cannot create an exam';
  end;

  -- 11 a student cannot change an exam
  update public.exams set status = 'ended' where id = v_active;
  get diagnostics v_n = row_count;
  v_out := v_out || E'\n' || case when v_n = 0 then 'PASS' else 'FAIL' end
    || ' 11 student changed ' || v_n || ' exams (expected 0)';

  ----------------------------------------------------------------
  -- TEACHER
  ----------------------------------------------------------------
  reset role;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- 12 a teacher cannot use report_incident
  v_res := public.report_incident(v_active, 'head_turn',
    '{"occurrences":5,"windowSeconds":60}'::jsonb);
  v_out := v_out || E'\n'
    || case when not (v_res ->> 'ok')::boolean then 'PASS' else 'FAIL' end
    || ' 12 teacher report: ' || (v_res ->> 'message');

  -- 13 a teacher can read incidents (the seeded one plus the student's report)
  select count(*) into v_n from public.incidents;
  v_out := v_out || E'\n' || case when v_n >= 2 then 'PASS' else 'FAIL' end
    || ' 13 teacher sees ' || v_n || ' incidents (expected 2 or more)';

  -- 14 the student's report was stored with forced status and source
  select count(*) into v_n from public.incidents
  where student_id = v_student and id <> v_incident
    and status = 'pending' and source = 'simulated'
    and student_name is not null and student_name <> '';
  v_out := v_out || E'\n' || case when v_n = 1 then 'PASS' else 'FAIL' end
    || ' 14 stored report is pending + simulated with a name (' || v_n || ' found)';

  -- 15 a teacher can change an incident status
  update public.incidents set status = 'reviewed' where id = v_incident
  returning status into v_status;
  v_out := v_out || E'\n' || case when v_status = 'reviewed' then 'PASS' else 'FAIL' end
    || ' 15 teacher status update gives: ' || coalesce(v_status, 'nothing');

  -- 16 a teacher cannot change other incident columns
  begin
    update public.incidents set student_name = 'Changed' where id = v_incident;
    v_out := v_out || E'\nFAIL 16 teacher changed another incident column';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 16 teacher cannot change other incident columns';
  end;

  -- 17 a teacher can create an exam of their own
  begin
    insert into public.exams (teacher_id, title, duration_minutes)
    values (v_teacher, 'Teacher exam', 45);
    v_out := v_out || E'\nPASS 17 teacher can create an exam';
  exception when insufficient_privilege then
    v_out := v_out || E'\nFAIL 17 teacher could not create an exam';
  end;

  ----------------------------------------------------------------
  -- NOT SIGNED IN
  ----------------------------------------------------------------
  reset role;
  set local role anon;

  -- 18 an anonymous visitor cannot call report_incident
  begin
    perform public.report_incident(v_active, 'head_turn',
      '{"occurrences":5,"windowSeconds":60}'::jsonb);
    v_out := v_out || E'\nFAIL 18 anonymous user could call report_incident';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 18 anonymous user cannot call report_incident';
  end;

  -- 19 an anonymous visitor cannot read exams
  begin
    select count(*) into v_n from public.exams;
    v_out := v_out || E'\nFAIL 19 anonymous user could read exams';
  exception when insufficient_privilege then
    v_out := v_out || E'\nPASS 19 anonymous user cannot read exams';
  end;

  reset role;
  raise exception E'TEST RESULTS (this red error is expected; it discards the test data):%', v_out;
end;
$$;