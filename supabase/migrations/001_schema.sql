-- Enable UUID
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'student' check (role in ('student','manager','admin')),
  created_at timestamptz default now()
);

-- Portal clients (one per enrollment/semester)
create table public.portal_clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  -- Portal credentials (encrypted at app level)
  portal_url text not null,
  portal_username text not null,
  portal_password_encrypted text not null,  -- AES encrypted
  university_name text not null,
  student_name text not null,
  student_id text,
  -- Semester info
  semester text not null,          -- e.g. "Spring 2025"
  semester_start date not null,
  semester_end date not null,
  timezone text default 'America/New_York',
  -- Plan
  plan text default 'standard' check (plan in ('basic','standard','premium')),
  price numeric(10,2) not null,
  payment_status text default 'pending' check (payment_status in ('pending','paid','refunded')),
  -- Status
  status text default 'pending' check (status in ('pending','active','paused','completed','cancelled')),
  assigned_manager_id uuid references public.profiles(id),
  -- Special instructions
  instructions text,
  courses jsonb default '[]',       -- [{name, code, professor, credits}]
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks (assignments, quizzes, discussions tracked per client)
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.portal_clients(id) on delete cascade,
  -- Task details
  title text not null,
  course text,
  task_type text default 'assignment' check (task_type in ('assignment','quiz','discussion','exam','project','other')),
  due_date timestamptz,
  instructions text,
  -- Status
  status text default 'pending' check (status in ('pending','in_progress','submitted','completed','missed')),
  priority text default 'normal' check (priority in ('low','normal','high','urgent')),
  -- Completion
  submitted_at timestamptz,
  grade text,
  manager_notes text,
  -- File
  submission_file_url text,
  submission_file_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weekly reports
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.portal_clients(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  summary text,
  tasks_completed int default 0,
  tasks_pending int default 0,
  tasks_upcoming int default 0,
  overall_status text default 'on_track',
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Messages (student <-> manager)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.portal_clients(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  sender_role text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.portal_clients enable row level security;
alter table public.tasks enable row level security;
alter table public.reports enable row level security;
alter table public.messages enable row level security;

-- Profiles policies
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Portal clients — students see own, admins/managers see all
create policy "clients_student_select" on public.portal_clients for select using (auth.uid() = user_id);
create policy "clients_admin_select" on public.portal_clients for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);
create policy "clients_insert" on public.portal_clients for insert with check (auth.uid() = user_id);
create policy "clients_admin_update" on public.portal_clients for update using (
  auth.uid() = user_id or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- Tasks
create policy "tasks_select" on public.tasks for select using (
  exists (select 1 from public.portal_clients where id = tasks.client_id and user_id = auth.uid())
  or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);
create policy "tasks_admin_all" on public.tasks for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);

-- Reports & messages
create policy "reports_select" on public.reports for select using (
  exists (select 1 from public.portal_clients where id = reports.client_id and user_id = auth.uid())
  or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);
create policy "messages_select" on public.messages for select using (
  exists (select 1 from public.portal_clients where id = messages.client_id and user_id = auth.uid())
  or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager'))
);
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Supabase storage bucket for task files
insert into storage.buckets (id, name, public) values ('task-files', 'task-files', true) on conflict do nothing;
