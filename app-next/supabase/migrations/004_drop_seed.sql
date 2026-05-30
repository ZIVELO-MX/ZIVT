-- ============================================================
-- 004_drop_seed.sql — Eliminar datos seed
-- Ejecutar SOLO cuando el panel esté 100% conectado a Supabase
-- y los datos reales ya estén en producción.
-- ============================================================

delete from public.learning_tasks where id like 'l%';
delete from public.notifications;
delete from public.tasks      where id like 't%';
delete from public.clients    where id like 'c%';
delete from public.projects   where id like 'p%';

-- profiles NO se borra aquí — vive ligado a auth.users
-- para limpiar profiles, elimina el usuario desde Supabase Auth → Users
