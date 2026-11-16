-- 1. Profiles table: one row per user, holds the role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher')),
  full_name text not null default '',
  created_at timestamptz not null default now()
);

-- 2. Turn on Row Level Security.
alter table public.profiles enable row level security;

-- 3. Logged-in users may read only their own row.
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- 4. Extra safety: block writes through the API entirely.
--    (No insert/update/delete policies exist either.)
revoke insert, update, delete on public.profiles from anon, authenticated;

-- 5. When someone signs up, create their profile automatically.
--    The role is hardcoded to 'student'. It is never read from the sign-up form.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'student',
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();