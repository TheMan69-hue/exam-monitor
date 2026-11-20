-- Phase 5: group examinations by subject.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Existing exams are placed in the "General" subject; rename them afterwards if you like:
--   update public.exams set subject = 'Mathematics' where title ilike '%math%';

alter table public.exams
  add column if not exists subject text not null default 'General';

alter table public.exams
  drop constraint if exists exams_subject_length;

alter table public.exams
  add constraint exams_subject_length
  check (char_length(subject) between 1 and 60);

create index if not exists exams_subject_idx on public.exams (subject);
