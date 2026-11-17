begin;

-- 1. Helper: is the signed-in user a teacher? (Used by the RLS policies.)
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'teacher'
  );
$$;

revoke all on function public.is_teacher() from public, anon, authenticated;
grant execute on function public.is_teacher() to authenticated;

-- 2. Exams
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  duration_minutes integer not null check (duration_minutes between 1 and 600),
  instructions text[] not null default array[
    'You may use the IDE installed on your computer.',
    'Do not communicate with classmates during the exam.',
    'Submit your work the way your teacher announces.'
  ],
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'ended')),
  created_at timestamptz not null default now()
);

alter table public.exams enable row level security;

-- Start from nothing, then grant only what is needed.
revoke all on public.exams from anon, authenticated;
grant select, insert on public.exams to authenticated;
grant update (title, duration_minutes, instructions, status)
  on public.exams to authenticated;

create policy "Signed-in users can read exams"
  on public.exams for select to authenticated
  using (true);

create policy "Teachers can create their own exams"
  on public.exams for insert to authenticated
  with check (public.is_teacher() and teacher_id = (select auth.uid()));

create policy "Teachers can update their own exams"
  on public.exams for update to authenticated
  using (public.is_teacher() and teacher_id = (select auth.uid()))
  with check (public.is_teacher() and teacher_id = (select auth.uid()));

-- 3. Incidents
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_name text not null,
  type text not null check (type in ('head_turn', 'gaze_away')),
  source text not null check (source in ('simulated', 'model')),
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'dismissed')),
  details jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now()
);

create index incidents_exam_student_time_idx
  on public.incidents (exam_id, student_id, detected_at desc);
create index incidents_detected_at_idx
  on public.incidents (detected_at desc);

alter table public.incidents enable row level security;

revoke all on public.incidents from anon, authenticated;
grant select on public.incidents to authenticated;
grant update (status) on public.incidents to authenticated;

create policy "Teachers can read incidents"
  on public.incidents for select to authenticated
  using (public.is_teacher());

create policy "Teachers can update incident status"
  on public.incidents for update to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- 4. The only way a student can create a flag.
create or replace function public.report_incident(
  p_exam_id uuid,
  p_type text,
  p_details jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Keep in sync with cooldownSeconds in src/lib/ai/config.ts.
  c_cooldown_seconds constant integer := 120;
  v_user uuid := (select auth.uid());
  v_role text;
  v_name text;
  v_exam_status text;
  v_last timestamptz;
  v_details jsonb;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'message', 'Not signed in.');
  end if;

  select role, full_name into v_role, v_name
  from public.profiles
  where id = v_user;

  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'message', 'Only students can report incidents.');
  end if;

  if p_type is null or p_type not in ('head_turn', 'gaze_away') then
    return jsonb_build_object('ok', false, 'message', 'Invalid report.');
  end if;

  select status into v_exam_status
  from public.exams
  where id = p_exam_id;

  if v_exam_status is distinct from 'active' then
    return jsonb_build_object('ok', false, 'message', 'This examination is not active.');
  end if;

  if jsonb_typeof(p_details -> 'occurrences') is distinct from 'number'
     or jsonb_typeof(p_details -> 'windowSeconds') is distinct from 'number' then
    return jsonb_build_object('ok', false, 'message', 'Invalid report.');
  end if;

  -- Rebuild the details from known keys only, with clamped numbers.
  v_details := jsonb_build_object(
    'occurrences',
      least(100, greatest(1, round((p_details ->> 'occurrences')::numeric))),
    'windowSeconds',
      least(3600, greatest(1, round((p_details ->> 'windowSeconds')::numeric)))
  );

  if (p_details ->> 'direction') in ('left', 'right', 'both') then
    v_details := v_details
      || jsonb_build_object('direction', p_details ->> 'direction');
  end if;

  if jsonb_typeof(p_details -> 'maxYawDegrees') = 'number' then
    v_details := v_details || jsonb_build_object(
      'maxYawDegrees',
      least(180, greatest(0, round((p_details ->> 'maxYawDegrees')::numeric)))
    );
  end if;

  if jsonb_typeof(p_details -> 'awayPercent') = 'number' then
    v_details := v_details || jsonb_build_object(
      'awayPercent',
      least(100, greatest(0, round((p_details ->> 'awayPercent')::numeric)))
    );
  end if;

  -- One report at a time per student per exam, so duplicates can't slip through.
  perform pg_advisory_xact_lock(
    hashtextextended(v_user::text || ':' || p_exam_id::text, 0)
  );

  select max(detected_at) into v_last
  from public.incidents
  where student_id = v_user and exam_id = p_exam_id;

  if v_last is not null
     and v_last > now() - make_interval(secs => c_cooldown_seconds) then
    return jsonb_build_object(
      'ok', false,
      'message', 'A flag was sent recently, so this one was skipped (cooldown).'
    );
  end if;

  -- Identity, name, status and source are decided here, never by the caller.
  insert into public.incidents
    (exam_id, student_id, student_name, type, source, status, details, detected_at)
  values
    (p_exam_id, v_user, coalesce(nullif(btrim(v_name), ''), 'Student'),
     p_type, 'simulated', 'pending', v_details, now());

  return jsonb_build_object(
    'ok', true,
    'message', 'Flag sent to your teacher (simulated).'
  );
end;
$$;

revoke all on function public.report_incident(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.report_incident(uuid, text, jsonb)
  to authenticated;

-- 5. Let the teacher's browser receive new incidents live (used in Batch 4.4).
--    Realtime follows the RLS rules above, so only teachers receive them.
alter publication supabase_realtime add table public.incidents;

-- 6. Demo exams, owned by the first teacher account (skipped if exams exist
--    or if no teacher account exists yet).
insert into public.exams (teacher_id, title, duration_minutes, status)
select t.id, e.title, e.duration_minutes, e.status
from (
  select id from public.profiles
  where role = 'teacher'
  order by created_at
  limit 1
) as t
cross join (
  values
    ('Programming Fundamentals – Midterm Lab Exam', 90, 'active'),
    ('Data Structures – Practical Exam', 120, 'active'),
    ('Web Development – Final Lab', 150, 'scheduled')
) as e(title, duration_minutes, status)
where not exists (select 1 from public.exams);

commit;