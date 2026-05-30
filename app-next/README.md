# Zivelo Panel

Workspace management panel — proyectos, tareas, clientes y equipo con autenticación real y datos persistentes en Supabase.

## Stack

| Paquete | Versión |
|---------|---------|
| Next.js | 16.2.6 (Turbopack) |
| React | 19.2.6 |
| Tailwind CSS | 4.3.0 |
| TypeScript | 6.0.3 |
| Supabase SSR | 0.10.x |
| Supabase JS | 2.x |

## Getting started

```bash
# Variables de entorno
cp .env.example .env.local
# Llenar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev    # http://localhost:3000
npm run build  # Producción
```

## Supabase

Las migrations están en `supabase/migrations/`:

1. `001_schema.sql` — Tablas: profiles, projects, tasks, clients, notifications, learning_tasks
2. `002_rls.sql` — Row Level Security por rol (founder, admin, editor, viewer)
3. `003_seed.sql` — Seed data equivalente a los mocks

Ejecutar en Supabase Studio → SQL Editor en ese orden.

## Estructura

```
app/
  page.tsx          # SPA con routing interno por view state
  login/page.tsx    # Login con Supabase Auth
  globals.css       # Design tokens (@theme), dark mode, density
  layout.tsx        # Root layout

components/
  ui.tsx            # Atomicos: Avatar, Card, Button, Drawer, Modal, Badge...
  sidebar.tsx       # Sidebar + Topbar
  modals.tsx        # Drawers y modales: UserMenu, CommandPalette, NotificationsDrawer...
  dashboard.tsx     # KPIs, Donut chart, MiniBarChart
  kanban.tsx        # Drag & drop kanban con TaskDetail
  projects.tsx      # Grid/table de proyectos con menú contextual
  clients.tsx       # CRUD de clientes
  users.tsx         # Miembros + grupos de trabajo
  settings.tsx      # Cuenta, apariencia, notificaciones, equipo
  profile.tsx       # Perfil del usuario
  learning.tsx      # Material de aprendizaje

lib/
  data.ts           # Tipos y datos mock (transición)
  utils.ts          # exportToCSV()
  supabase/
    client.ts       # createBrowserClient
    server.ts       # createServerClient
    types.ts        # Database types + mappers snake↔camelCase
    queries.ts      # CRUD tipado para todas las tablas
    useRole.ts      # Hook useRole() para control de acceso

proxy.ts            # Middleware — redirige a /login sin sesión
```

## Vistas

- **Dashboard** — KPIs, proyectos activos, tareas en curso, MRR, próximas entregas, carga del equipo
- **Kanban** — Tablero drag & drop con columnas backlog/todo/progress/review/done
- **Proyectos** — Grid y tabla con métricas, filtros, búsqueda, duplicar/eliminar
- **Clientes** — Cartera de clientes con MRR, estado y contacto
- **Usuarios** — Miembros del workspace + grupos de trabajo
- **Learning** — Material de aprendizaje tipo kanban

## Arquitectura

- `'use client'` en componentes de UI, `createClient()` de `client.ts`
- Server Components y actions usan `createClient()` de `server.ts`
- Mutations: optimistic update local → Supabase en background → rollback en catch
- Realtime subscriptions vía `postgres_changes` channel único
- Tipos prefieren `lib/supabase/types` sobre `lib/data` durante la transición
