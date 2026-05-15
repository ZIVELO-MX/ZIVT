# Zivelo — Panel de Control

## What This Is

Panel de control interno de Zivelo. Herramienta operativa real para gestionar proyectos, tareas (kanban), clientes y equipo. Construido en React 18 CDN + Tailwind CDN + Babel standalone — sin build step, sin framework.

La UI está completamente implementada con datos mock. El objetivo del roadmap es reemplazar cada mock por datos reales conectados a Supabase.

## Core Value

El equipo Zivelo puede operar su día a día desde un solo panel: ver el estado de proyectos, mover tareas en el kanban, gestionar clientes y controlar accesos — todo con datos reales y persistentes.

## Context

- **Stack**: React 18 (CDN) + Babel Standalone + Tailwind CDN. Sin Node, sin bundler.
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Estado actual**: UI 100% implementada con mock data en `src/data.jsx` → `window.ZIV`
- **Vistas**: Dashboard, Kanban (drag & drop), Proyectos (grid/tabla), Clientes CRUD, Usuarios
- **Extras**: Dark mode (localStorage), Command palette ⌘K, Notificaciones drawer
- **Entry point**: `Panel de Control.html` → carga 12 archivos JSX via Babel standalone

## Audience

Equipo interno de Zivelo (5-7 personas). Raúl como admin/founder. Acceso por invitación únicamente.

## Requirements

### Validated

- ✓ UI completa con 5 vistas — implementada
- ✓ Dark mode con persistencia localStorage — implementada
- ✓ Command palette ⌘K — implementada
- ✓ Sidebar colapsable — implementada
- ✓ Kanban drag & drop (5 columnas) — implementada con mock
- ✓ Drawer de detalles para tareas, proyectos y clientes — implementada
- ✓ Formularios de creación/edición — implementados con mock
- ✓ Filtros avanzados en kanban — implementados

### Active

- [ ] Auth real con Supabase (login, sesión, logout)
- [ ] Schema Supabase: proyectos, tareas, clientes, equipo
- [ ] Proyectos — leer desde DB y mostrar en tiempo real
- [ ] Proyectos — CRUD completo (crear, editar, eliminar)
- [ ] Kanban — tareas reales con persistencia (crear, mover entre columnas, editar, eliminar)
- [ ] Clientes — CRUD completo real
- [ ] Usuarios/equipo — gestión con Supabase Auth (invitar, suspender, permisos)
- [ ] Dashboard — métricas reales calculadas desde DB
- [ ] Notificaciones — sistema básico real
- [ ] Deploy en producción (Vercel o similar)

### Out of Scope

- Migración a Next.js/Vite — el usuario eligió mantener React CDN
- Mobile app — solo web desktop por ahora
- Billing/pagos internos — no es el caso de uso
- Multi-workspace — un solo workspace Zivelo

## Key Decisions

| Decisión | Rationale | Resultado |
|----------|-----------|-----------|
| Mantener React CDN (sin build) | Decisión explícita del usuario | React 18 + Babel standalone |
| Supabase como backend | Consistente con otros proyectos Zivelo (GitSpeak, Prompt2Git) | Auth + Postgres + RLS |
| Sin migración de stack | La UI ya está terminada, solo conectar datos | — Pendiente |

## Evolution

Este documento evoluciona en cada transición de fase.

**Después de cada fase:**
1. ¿Requisitos validados? → Mover a Validated
2. ¿Requisitos nuevos emergentes? → Agregar a Active
3. ¿"What This Is" sigue preciso? → Actualizar si derivó

---
*Last updated: 2026-05-14 — inicialización del proyecto*
