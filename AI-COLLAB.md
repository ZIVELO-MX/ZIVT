# AI Collab — Zivelo Panel

## Stack actual

| Paquete | Versión |
|---------|---------|
| Next.js | 16.2.6 (Turbopack) |
| React | 19.2.6 |
| Tailwind CSS | 4.3.0 |
| TypeScript | 6.0.3 |
| @supabase/ssr | 0.10.x |
| @supabase/supabase-js | 2.x |

**Configuración Tailwind v4:** sin `tailwind.config.ts` — tokens definidos en `@theme {}` dentro de `app/globals.css`.

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `app/page.tsx` | SPA principal (routing interno por `view` state) |
| `app/login/page.tsx` | Login con Supabase Auth real |
| `app/globals.css` | Design tokens (`@theme`), dark mode, animaciones, density system |
| `app/layout.tsx` | Root layout con `suppressHydrationWarning` |
| `lib/data.ts` | Tipos TypeScript + datos mock (se reemplaza fase a fase) |
| `lib/utils.ts` | `exportToCSV()` |
| `lib/supabase/client.ts` | `createBrowserClient` — usar en Client Components |
| `lib/supabase/server.ts` | `createServerClient` — usar en Server Components / actions |
| `proxy.ts` | Protección de rutas — redirige a `/login` sin sesión activa |
| `next.config.mjs` | Security headers + CSP (Supabase en connect-src vía env var) |
| `supabase/migrations/001_schema.sql` | Tablas: profiles, projects, tasks, clients, notifications, learning_tasks |
| `supabase/migrations/002_rls.sql` | RLS policies — acceso por rol (`my_permission()`) |
| `supabase/migrations/003_seed.sql` | Seed data equivalente a los mocks |
| `components/ui.tsx` | Avatar, Card, Button, Drawer, Modal, Badge, etc. |
| `components/sidebar.tsx` | Sidebar + Topbar |
| `components/modals.tsx` | UserMenu, CommandPalette, NotificationsDrawer, InviteModal, etc. |
| `components/dashboard.tsx` | Dashboard con StatCard, Donut, MiniBarChart |
| `components/kanban.tsx` | Kanban con drag & drop, TaskDetail |
| `components/projects.tsx` | Proyectos grid/table con menú contextual |
| `components/clients.tsx` | Clientes CRUD |
| `components/users.tsx` | Usuarios CRUD |
| `components/settings.tsx` | Cuenta, Apariencia, Notificaciones, Equipo |
| `components/controls.tsx` | CustomSelect, CustomDatePicker |

---

## Estado del proyecto

### ✅ Fase completada: UI/UX Polish + Funcionalidad Simulada
Todas las vistas implementadas con mock data. Ver historial de sesiones anteriores.

### ✅ Phase 1 completada: Auth real
- Login conectado a Supabase `signInWithPassword`
- `proxy.ts` protege todas las rutas sin sesión
- `lib/supabase/client.ts` y `lib/supabase/server.ts` listos
- `.env.local` con credenciales (no versionado)
- CSP sin URL hardcodeada (usa `process.env.NEXT_PUBLIC_SUPABASE_URL`)

### ✅ Phase 2 completada: Schema & migraciones
- `supabase/migrations/001_schema.sql` — 6 tablas creadas
- `supabase/migrations/002_rls.sql` — RLS activado, acceso por rol
- `supabase/migrations/003_seed.sql` — seed data lista para ejecutar

**⚠️ Pendiente ejecutar en Supabase SQL Editor:**
1. `001_schema.sql`
2. `002_rls.sql`
3. `003_seed.sql` (ajustar UUIDs de profiles según usuarios reales en Supabase Auth)

---

## ✅ Phase 3 + 4 completadas: Proyectos CRUD real

- `lib/supabase/types.ts` — tipos completos (Project, Task, Client, Profile) + mappers snake↔camelCase
- `lib/supabase/queries.ts` — CRUD completo para projects y tasks
- `components/projects.tsx` — conectado a Supabase con mutations + fallback local + `router.refresh()`
- `app/page.tsx` — tasks y projects desde Supabase con realtime subscription única por tabla

---

## ✅ Phase 5 completada: Kanban real

- `lib/supabase/queries.ts` — `getTasks, createTask, updateTask, deleteTask, moveTask`
- `lib/supabase/types.ts` — `taskRowToTask, taskToTaskRow`
- `app/page.tsx` — tasks desde Supabase con realtime
- `components/kanban.tsx` — drag-drop → `moveTask`, CRUD completo → `createTask/updateTask/deleteTask`

## ✅ Phase 6 completada: Clientes CRUD real

- `lib/supabase/queries.ts` — `getClients, createClient, updateClient, deleteClient`
- `lib/supabase/types.ts` — `clientRowToClient, clientToClientRow`
- `app/page.tsx` — clients desde Supabase con realtime
- `components/clients.tsx` — mutations con optimistic update + rollback en catch

---

## ✅ Phase 7 completada: Usuarios & equipo

- `lib/supabase/types.ts` — `profileRowToProfile, profileToProfileRow`
- `lib/supabase/queries.ts` — `getProfiles(), updateProfile()`
- `lib/supabase/useRole.ts` — hook `useRole(): ProfilePermission | null`
- `app/page.tsx` — profiles state + realtime + `<Users users={profiles} setUsers={setProfiles}/>`
- `components/users.tsx` — usa prop `users`, llama `updateProfile` con optimistic + rollback
- `components/sidebar.tsx` — oculta Clientes a editor/viewer
- `components/dashboard.tsx` — oculta MRR/revenue a editor/viewer con RestrictedStatCard
- `components/clients.tsx` — mensaje de acceso restringido si no es founder/admin

## ✅ Phase 8 completada: Dashboard real

- Gráfica "Tareas completadas" ahora calcula desde `tasks` reales agrupadas por mes (`updatedAt ?? createdAt`)
- KPIs todos desde props reales: proyectos activos, tareas en curso, clientes, MRR
- "Próximas entregas" desde tasks reales con `due` ordenadas
- "Carga del equipo" cuenta tareas abiertas reales por miembro

---

## ✅ Phase 9 completada: Notificaciones

- `lib/supabase/types.ts` — `notificationRowToNotification()`
- `lib/supabase/queries.ts` — `getNotifications, markNotificationRead, markAllNotificationsRead`
- `lib/supabase/notify.ts` — `notifyTaskCreated(), notifyTaskCompleted()`
- `app/page.tsx` — notifications state + realtime + `<NotificationsDrawer>` wired con optimistic mark-read
- `components/modals.tsx` — NotificationsDrawer acepta `notifications`, `onMarkRead`, `onMarkAllRead`
- `components/kanban.tsx` — llama `notifyTaskCreated/notifyTaskCompleted` en background

## ✅ Phase 10 completada: Deploy & Hardening

**Hardening completado:**
- `components/modals.tsx` — logout llama `supabase.auth.signOut()` real antes de redirect
- `next.config.mjs` — security headers completos + CSP dinámico sin hardcode
- `.gitignore` — `.env.local` protegido en raíz
- `.env.example` — documenta `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Build de producción: ✅ sin errores ni warnings
- Sin `console.log` ni credenciales hardcodeadas en source

---

## 🚀 Deploy a Vercel

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Desde la raíz del repositorio
vercel

# 3. Cuando Vercel pregunte:
#    - Root Directory: . (raíz del repo)
#    - Framework: Next.js (detecta automático)
```

**Variables de entorno a configurar en Vercel Dashboard → Settings → Environment Variables:**

| Key | Valor |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rnovkjurksxyddgsqkpe.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key de Supabase → Project Settings → API) |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | `zivelo.dev` |

**Alternativa vía Dashboard:**
1. vercel.com/new → importar repositorio
2. Root Directory: `.` (raíz del repo)
3. Agregar las 3 env vars arriba
4. Deploy

---

## 🔜 FASE ACTUAL: Phase 9 — Notificaciones (archivada)

---

## 📋 Tareas por agente

### 🔴 Claude — Phase 9 completado: Queries de notificaciones

- [x] `notificationRowToNotification()` en `lib/supabase/types.ts`
- [x] `getNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()` en `lib/supabase/queries.ts`
- [x] `app/page.tsx` — `useState<Notification[]>([])`, fetch + realtime tabla `notifications`
- [x] `<NotificationsDrawer notifications={...} onMarkRead={...} onMarkAllRead={...}/>` con optimistic update

### 🟡 Opencode — Phase 9: Conectar NotificationsDrawer a Supabase

**Contexto:** `components/modals.tsx` contiene `NotificationsDrawer` que actualmente usa datos mock.
Necesita recibir `notifications` y `setNotifications` como props.

**Tareas:**
- [ ] En `NotificationsDrawer`: aceptar props `notifications: Notification[]` y `onMarkRead: (id: string) => void`
- [ ] Reemplazar el array mock interno por la prop `notifications`
- [ ] Botón "Marcar como leída" → llamar `onMarkRead(id)` + optimistic update local
- [ ] Botón "Marcar todas" → llamar `onMarkAllRead()` + optimistic update
- [ ] Mantener el diseño existente — solo cambiar la fuente de datos
- [ ] Importar tipo `Notification` de `lib/supabase/types`

**Restricciones:**
- NO cambiar la UI del drawer ni los estilos
- NO agregar dependencias
- El badge de notificaciones no leídas en Topbar ya usa el count del array — funcionará automáticamente

### 🔵 Codex — Phase 9: Notificaciones automáticas al crear/completar tareas

**Contexto:** El sistema de notificaciones necesita eventos reales. Cuando una tarea se crea o se mueve a `done`, se debe insertar una notificación en la tabla `notifications`.

**Tareas:**
- [x] Crear helper `lib/supabase/notify.ts`:
  ```ts
  export async function notifyTaskCreated(taskTitle: string, creatorId: string): Promise<void>
  export async function notifyTaskCompleted(taskTitle: string, completedById: string): Promise<void>
  // INSERT en tabla notifications con los campos: user_id, type, title, body
  ```
- [x] En `components/kanban.tsx`: llamar `notifyTaskCompleted()` cuando se mueve una tarea a col `done`
- [x] En `components/kanban.tsx`: llamar `notifyTaskCreated()` cuando se crea una nueva tarea
- [x] Usar `createClient()` de `lib/supabase/client.ts` en el helper

**Restricciones:**
- Las notificaciones son best-effort — si falla el INSERT, no lanzar error al usuario
- `user_id` = el usuario autenticado actual (usar `supabase.auth.getUser()`)
- NO modificar la UI del kanban

---

## Convenciones de código

- `createClient()` de `lib/supabase/client.ts` → Client Components (`'use client'`)
- `createClient()` de `lib/supabase/server.ts` → Server Components y server actions
- Mutations: siempre llamar `router.refresh()` después de una escritura exitosa
- Errores: mostrar en el estado local del componente, no `console.error` en producción
- Tipos: preferir los de `lib/supabase/types.ts` sobre los de `lib/data.ts`

## Reglas generales

- **Sin tocar `lib/data.ts` schema** — los tipos deben mantenerse para compatibilidad durante la transición
- **Sin agregar dependencias npm** salvo que sea indispensable
- **Un commit por tarea** — mensaje: `feat: [descripción]`

## Comandos

```bash
npm run dev    # desarrollo
npm run build  # build producción
```
