-- ============================================================
-- 001_schema.sql — Zivelo Panel: tablas base
-- Ejecutar en: Supabase Studio → SQL Editor
-- ============================================================

-- Profiles (extiende auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  initials    text,
  color       text        default '#6B6B6B',
  role        text,
  phone       text,
  permission  text        default 'viewer'
                check (permission in ('founder','admin','editor','viewer')),
  status      text        default 'active'
                check (status in ('active','invited','suspended')),
  joined_at   timestamptz default now(),
  last_active timestamptz default now()
);

-- Projects
create table if not exists public.projects (
  id           text primary key,
  name         text    not null,
  client       text,
  kind         text,
  status       text    default 'in_progress'
                 check (status in ('todo','in_progress','review','done')),
  health       text    default 'on_track'
                 check (health in ('on_track','at_risk')),
  progress     int     default 0,
  tasks_done   int     default 0,
  tasks_total  int     default 0,
  budget       numeric default 0,
  spent        numeric default 0,
  start_date   date,
  due_date     date,
  accent       text    default '#D72228',
  team         text[]  default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Tasks (kanban)
create table if not exists public.tasks (
  id         text primary key,
  col        text    not null default 'todo'
               check (col in ('todo','progress','review','done','blocked')),
  project    text,
  title      text    not null,
  tag        text,
  priority   text    default 'med'
               check (priority in ('low','med','high')),
  due        date,
  assignee   text[]  default '{}',
  subtasks   jsonb   default '[]',
  comments   int     default 0,
  progress   jsonb   default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients
create table if not exists public.clients (
  id         text primary key,
  name       text    not null,
  industry   text,
  contact    text,
  email      text,
  phone      text,
  city       text,
  status     text    default 'active'
               check (status in ('active','lead','paused')),
  mrr        numeric default 0,
  since      date,
  projects   int     default 0,
  notes      text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    references public.profiles(id) on delete cascade,
  type       text    not null,
  title      text    not null,
  body       text,
  unread     boolean default true,
  created_at timestamptz default now()
);

-- Learning tasks
create table if not exists public.learning_tasks (
  id          text primary key,
  col         text    default 'todo'
                check (col in ('todo','progress','done')),
  title       text    not null,
  description text,
  url         text,
  type        text    default 'article'
                check (type in ('article','video','course','book')),
  assignee    text[]  default '{}',
  due         date,
  duration    text,
  tags        text[]  default '{}',
  progress    jsonb   default '{}',
  created_at  timestamptz default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger clients_updated_at before update on public.clients
  for each row execute procedure public.set_updated_at();
