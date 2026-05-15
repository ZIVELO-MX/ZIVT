# Requirements — Zivelo Panel de Control

## v1 Requirements

### AUTH — Autenticación

- [ ] **AUTH-01**: Usuario puede iniciar sesión con email y contraseña en `Login.html`
- [ ] **AUTH-02**: Sesión persiste entre recargas (Supabase session + localStorage)
- [ ] **AUTH-03**: Usuario no autenticado es redirigido a `Login.html`
- [ ] **AUTH-04**: Usuario puede cerrar sesión desde el menú de usuario

### SCHEMA — Base de datos

- [ ] **SCHEMA-01**: Tabla `projects` con campos: id, name, client_id, kind, status, progress, start, due, accent, budget, spent, tasks_done, tasks_total, health, team (array de user ids)
- [ ] **SCHEMA-02**: Tabla `tasks` con campos: id, project_id, col (columna kanban), title, tag, priority, due, assignees (array), subtasks (jsonb), comments_count
- [ ] **SCHEMA-03**: Tabla `clients` con campos: id, name, industry, contact, email, phone, city, since, status, mrr
- [ ] **SCHEMA-04**: RLS activado en todas las tablas — solo usuarios autenticados del workspace acceden
- [ ] **SCHEMA-05**: Migraciones versionadas en `supabase/migrations/`

### PROJECTS — Proyectos

- [ ] **PROJ-01**: Vista Proyectos carga datos reales de Supabase al abrir
- [ ] **PROJ-02**: Usuario puede crear un nuevo proyecto que persiste en DB
- [ ] **PROJ-03**: Usuario puede editar nombre, estado, fechas, presupuesto y equipo de un proyecto
- [ ] **PROJ-04**: Usuario puede eliminar un proyecto (con confirmación)
- [ ] **PROJ-05**: Filtros por estado funcionan sobre datos reales
- [ ] **PROJ-06**: Progreso del proyecto se actualiza automáticamente cuando cambian las tareas

### KANBAN — Tablero de tareas

- [ ] **KANBAN-01**: Tablero carga tareas reales desde Supabase al abrir
- [ ] **KANBAN-02**: Usuario puede crear una nueva tarea que persiste en DB
- [ ] **KANBAN-03**: Arrastrar una tarjeta entre columnas actualiza `col` en DB instantáneamente
- [ ] **KANBAN-04**: Usuario puede editar título, tag, prioridad, fecha y asignados de una tarea
- [ ] **KANBAN-05**: Usuario puede eliminar una tarea (con confirmación)
- [ ] **KANBAN-06**: Subtareas se guardan en DB (jsonb) y su estado persiste
- [ ] **KANBAN-07**: Filtros por proyecto, asignado, tag y prioridad funcionan sobre datos reales

### CLIENTS — Clientes

- [ ] **CLI-01**: Vista Clientes carga datos reales desde Supabase
- [ ] **CLI-02**: Usuario puede crear un nuevo cliente que persiste en DB
- [ ] **CLI-03**: Usuario puede editar todos los campos de un cliente
- [ ] **CLI-04**: Usuario puede eliminar un cliente (con confirmación)
- [ ] **CLI-05**: Los proyectos asociados a un cliente se muestran en el drawer de detalle

### USERS — Equipo

- [ ] **USR-01**: Vista Usuarios lista los miembros reales del workspace (desde Supabase Auth + tabla profiles)
- [ ] **USR-02**: Admin puede invitar un nuevo miembro (envío real de email de invitación)
- [ ] **USR-03**: Admin puede editar rol y nivel de acceso de un miembro
- [ ] **USR-04**: Admin puede suspender/reactivar un miembro

### DASHBOARD — Métricas

- [ ] **DASH-01**: KPIs (proyectos activos, tareas en curso, clientes activos, MRR) calculados desde DB
- [ ] **DASH-02**: Gráfica de tareas completadas refleja datos reales
- [ ] **DASH-03**: Lista "Próximas entregas" usa fechas reales de tareas
- [ ] **DASH-04**: "Carga del equipo" muestra tareas reales por miembro

### NOTIFS — Notificaciones

- [ ] **NOTIF-01**: Tabla `notifications` en Supabase registra eventos (asignación, mención, completado)
- [ ] **NOTIF-02**: Drawer de notificaciones carga notificaciones reales del usuario autenticado
- [ ] **NOTIF-03**: Marcar como leída actualiza el registro en DB

### DEPLOY — Producción

- [ ] **DEPLOY-01**: Panel disponible en URL pública (Vercel / Netlify / dominio Zivelo)
- [ ] **DEPLOY-02**: Variables de entorno de Supabase configuradas correctamente
- [ ] **DEPLOY-03**: Solo usuarios del workspace pueden acceder (RLS + Auth gate)

---

## v2 (Diferido)

- Comentarios en tareas (hilo real de actividad)
- Tiempo real con Supabase Realtime (live updates sin recargar)
- Exportación a CSV desde Clientes y Proyectos
- Reportes por proyecto (PDF)
- Integración con Slack para notificaciones

## Out of Scope

- Migración a Next.js/Vite — usuario eligió mantener React CDN sin build
- Multi-workspace — un solo workspace Zivelo
- Mobile app
- Billing/pagos internos

---

## Traceability

| REQ-ID | Fase |
|--------|------|
| AUTH-01..04 | Fase 1 |
| SCHEMA-01..05 | Fase 2 |
| PROJ-01..06 | Fases 3-4 |
| KANBAN-01..07 | Fase 5 |
| CLI-01..05 | Fase 6 |
| USR-01..04 | Fase 7 |
| DASH-01..04 | Fase 8 |
| NOTIF-01..03 | Fase 9 |
| DEPLOY-01..03 | Fase 10 |
