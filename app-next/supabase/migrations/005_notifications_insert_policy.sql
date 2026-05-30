-- ============================================================
-- 005_notifications_insert_policy.sql — allow own notifications
-- ============================================================

create policy "notifications: own insert"
  on public.notifications for insert
  to authenticated
  with check (user_id = auth.uid());
