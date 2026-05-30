-- ============================================================
-- 002_rls.sql — Row Level Security
-- Ejecutar DESPUÉS de 001_schema.sql
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.tasks           enable row level security;
alter table public.clients         enable row level security;
alter table public.notifications   enable row level security;
alter table public.learning_tasks  enable row level security;

-- Helper: permiso del usuario autenticado
create or replace function public.my_permission()
returns text language sql stable security definer as $$
  select permission from public.profiles where id = auth.uid()
$$;

-- ── PROFILES ──────────────────────────────────────────────
-- Todos los miembros autenticados pueden ver perfiles
create policy "profiles: authenticated read"
  on public.profiles for select
  to authenticated
  using (true);

-- Solo el propio usuario puede actualizar su perfil
create policy "profiles: self update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- Solo admin/founder pueden insertar perfiles (invitar)
create policy "profiles: admin insert"
  on public.profiles for insert
  to authenticated
  with check (public.my_permission() in ('admin','founder'));

-- ── PROJECTS ──────────────────────────────────────────────
create policy "projects: authenticated read"
  on public.projects for select
  to authenticated using (true);

create policy "projects: editor write"
  on public.projects for insert
  to authenticated
  with check (public.my_permission() in ('admin','founder','editor'));

create policy "projects: editor update"
  on public.projects for update
  to authenticated
  using (public.my_permission() in ('admin','founder','editor'));

create policy "projects: admin delete"
  on public.projects for delete
  to authenticated
  using (public.my_permission() in ('admin','founder'));

-- ── TASKS ─────────────────────────────────────────────────
create policy "tasks: authenticated read"
  on public.tasks for select
  to authenticated using (true);

create policy "tasks: editor write"
  on public.tasks for insert
  to authenticated
  with check (public.my_permission() in ('admin','founder','editor'));

create policy "tasks: editor update"
  on public.tasks for update
  to authenticated
  using (public.my_permission() in ('admin','founder','editor'));

create policy "tasks: admin delete"
  on public.tasks for delete
  to authenticated
  using (public.my_permission() in ('admin','founder'));

-- ── CLIENTS ───────────────────────────────────────────────
-- Solo founder y admin ven clientes (confidencialidad financiera)
create policy "clients: admin read"
  on public.clients for select
  to authenticated
  using (public.my_permission() in ('admin','founder'));

create policy "clients: admin write"
  on public.clients for insert
  to authenticated
  with check (public.my_permission() in ('admin','founder'));

create policy "clients: admin update"
  on public.clients for update
  to authenticated
  using (public.my_permission() in ('admin','founder'));

create policy "clients: admin delete"
  on public.clients for delete
  to authenticated
  using (public.my_permission() in ('admin','founder'));

-- ── NOTIFICATIONS ─────────────────────────────────────────
-- Cada usuario solo ve sus propias notificaciones
create policy "notifications: own read"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications: own update"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

-- ── LEARNING ──────────────────────────────────────────────
create policy "learning: authenticated read"
  on public.learning_tasks for select
  to authenticated using (true);

create policy "learning: editor write"
  on public.learning_tasks for insert
  to authenticated
  with check (public.my_permission() in ('admin','founder','editor'));

create policy "learning: editor update"
  on public.learning_tasks for update
  to authenticated
  using (public.my_permission() in ('admin','founder','editor'));
