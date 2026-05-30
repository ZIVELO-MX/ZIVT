# Roadmap — Zivelo Panel de Control

**10 fases** | **33 requisitos mapeados** | Cobertura 100% ✓

---

## Resumen

| # | Fase | Goal | REQs | Criterios |
|---|------|------|------|-----------|
| 1 | Auth real | Login funcional con Supabase | AUTH-01..04 | 4 |
| 2 | Schema & migraciones | DB lista con tablas, RLS y seed | SCHEMA-01..05 | 3 |
| 3 | Proyectos — lectura | Vista Proyectos con datos reales | PROJ-01 | 3 |
| 4 | Proyectos — CRUD | Crear, editar, eliminar proyectos | PROJ-02..06 | 4 |
| 5 | Kanban real | Tablero con tareas persistentes | KANBAN-01..07 | 5 |
| 6 | Clientes CRUD | Gestión real de clientes | CLI-01..05 | 4 |
| 7 | Usuarios & equipo | Gestión de miembros con Supabase Auth | USR-01..04 | 4 |
| 8 | Dashboard real | Métricas calculadas desde DB | DASH-01..04 | 4 |
| 9 | Notificaciones | Sistema básico de notificaciones | NOTIF-01..03 | 3 |
| 10 | Deploy & hardening | Producción en URL pública | DEPLOY-01..03 | 3 |

---

### Phase 1: Auth real
**Goal:** El login en `Login.html` funciona con Supabase Auth. El panel redirige a login si no hay sesión activa. El logout desde el menú de usuario destruye la sesión.
**Mode:** mvp
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria:**
1. Usuario ingresa email + contraseña en `Login.html` → accede al panel sin recarga manual
2. Recargar `Panel de Control.html` con sesión activa → panel carga normalmente (sin redirect)
3. Recargar `Panel de Control.html` sin sesión → redirige automáticamente a `Login.html`
4. Click en "Cerrar sesión" → sesión destruida, redirect a `Login.html`

---

### Phase 2: Schema & migraciones
**Goal:** Base de datos Supabase lista con todas las tablas necesarias, RLS activado, y datos seed que replican los mocks actuales para no romper el panel durante el desarrollo.
**Mode:** mvp
**Requirements:** SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05
**Success Criteria:**
1. `supabase/migrations/` contiene migrations versionadas para projects, tasks, clients, profiles y notifications
2. RLS activado en todas las tablas — query sin auth retorna 0 filas
3. Datos seed insertados en DB — las tablas tienen registros equivalentes a los mocks

---

### Phase 3: Proyectos — lectura
**Goal:** La vista Proyectos y el Dashboard cargan datos reales desde Supabase. Se elimina la dependencia de `window.ZIV.PROJECTS_INIT`.
**Mode:** mvp
**Requirements:** PROJ-01
**Success Criteria:**
1. Abrir vista Proyectos → las cards muestran proyectos reales de la DB (no del mock)
2. Filtros de estado (En progreso, En revisión, etc.) funcionan sobre datos reales
3. Crear un proyecto desde Supabase Studio → aparece en el panel sin recargar manualmente

---

### Phase 4: Proyectos — CRUD completo
**Goal:** El usuario puede crear, editar y eliminar proyectos desde el panel. Los cambios persisten inmediatamente en Supabase.
**Mode:** mvp
**Requirements:** PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06
**Success Criteria:**
1. Crear nuevo proyecto desde el modal → aparece en la lista al cerrar el modal
2. Editar nombre, estado y fechas de un proyecto → cambios visibles inmediatamente sin recarga
3. Eliminar proyecto → desaparece de la lista y no existe en DB
4. Progreso del proyecto se recalcula cuando las tareas del proyecto cambian en DB

---

### Phase 5: Kanban real
**Goal:** El tablero Kanban trabaja con tareas reales. Crear, mover, editar y eliminar tareas persiste en Supabase. El drag & drop actualiza la columna en DB al soltar.
**Mode:** mvp
**Requirements:** KANBAN-01, KANBAN-02, KANBAN-03, KANBAN-04, KANBAN-05, KANBAN-06, KANBAN-07
**Success Criteria:**
1. Abrir Kanban → tarjetas muestran tareas reales de DB (nombre, proyecto, tag, prioridad)
2. Arrastrar tarjeta de columna A a columna B → columna actualizada en DB, persiste al recargar
3. Crear nueva tarea → aparece en la columna correcta al cerrar el modal
4. Editar una tarea (título, tag, fecha) → cambios persisten al recargar
5. Subtareas marcadas como done → estado persiste en DB (jsonb)
6. Tarea puede marcarse como **Bloqueada** (col = `blocked`) → columna visual diferenciada en el tablero, persiste en DB

---

### Phase 6: Clientes CRUD
**Goal:** La vista Clientes trabaja con datos reales de la tabla `clients` en Supabase. CRUD completo desde el panel.
**Mode:** mvp
**Requirements:** CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria:**
1. Vista Clientes carga clientes reales de DB (nombre, industria, contacto, MRR)
2. Crear cliente → aparece en la tabla sin recargar
3. Editar cliente → cambios en DB visibles inmediatamente
4. Eliminar cliente → removido de DB, confirmado visualmente
5. Drawer de detalle del cliente muestra proyectos reales asociados

---

### Phase 7: Usuarios & equipo
**Goal:** La vista Usuarios lista los miembros reales del workspace desde Supabase Auth + tabla `profiles`. Admin puede invitar nuevos miembros y gestionar permisos.
**Mode:** mvp
**Requirements:** USR-01, USR-02, USR-03, USR-04
**Success Criteria:**
1. Vista Usuarios muestra miembros reales con su rol, estado y última actividad
2. Admin invita un nuevo miembro → email de Supabase Auth enviado, usuario aparece como "Invitado"
3. Admin cambia rol/permiso de un miembro → cambio en DB, visible en la misma vista
4. Admin suspende un miembro → estado cambia a "Suspendido" y persiste

#### Control de acceso por rol (confidencialidad financiera)
> **Regla**: Solo los roles `founder` y `admin` pueden acceder a información financiera y de clientes.

| Sección / dato | founder | admin | editor | viewer |
|----------------|:-------:|:-----:|:------:|:------:|
| Vista **Clientes** (completa) | ✅ | ✅ | ❌ | ❌ |
| KPI **MRR** en Dashboard | ✅ | ✅ | ❌ | ❌ |
| KPI **Clientes activos** en Dashboard | ✅ | ✅ | ❌ | ❌ |
| Gráfica de ingresos / analytics financieras | ✅ | ✅ | ❌ | ❌ |
| Feed de actividad (eventos de clientes) | ✅ | ✅ | ❌ | ❌ |
| Proyectos, Kanban, Usuarios, Aprendizaje | ✅ | ✅ | ✅ | ✅ |

**Implementación esperada (Phase 7 + Phase 8):**
- La tabla `profiles` en Supabase incluye el campo `permission` con valores: `founder`, `admin`, `editor`, `viewer`
- RLS en la tabla `clients` permite SELECT solo a `founder` y `admin`
- En el frontend, un hook `useRole()` expone el rol del usuario autenticado
- Los componentes `Clients`, `StatCard MRR`, `StatCard Clientes activos` y las analytics financieras del Dashboard se renderizan condicionalmente: si el rol no es `founder` ni `admin`, se muestra un placeholder de acceso restringido en lugar del contenido
- El sidebar no muestra el ítem **Clientes** a roles `editor` / `viewer`

---

### Phase 8: Dashboard real
**Goal:** Todos los KPIs y gráficas del Dashboard calculan sus valores desde DB. No hay números hardcodeados.
**Mode:** mvp
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria:**
1. KPIs (proyectos activos, tareas en curso, clientes activos, MRR) muestran datos reales de DB
2. Gráfica "Tareas completadas" refleja tareas reales con `col='done'` de los últimos 6 meses
3. "Próximas entregas" lista tareas reales ordenadas por `due`
4. "Carga del equipo" calcula tareas abiertas reales por miembro

---

### Phase 9: Notificaciones
**Goal:** El drawer de notificaciones muestra eventos reales del workspace (asignaciones, menciones, completados). Las notificaciones se marcan como leídas en DB.
**Mode:** mvp
**Requirements:** NOTIF-01, NOTIF-02, NOTIF-03
**Success Criteria:**
1. Tabla `notifications` existe en Supabase con registros reales de eventos del workspace
2. Abrir el drawer → notificaciones reales del usuario autenticado, ordenadas por fecha
3. Marcar una notificación como leída → `unread: false` en DB, indicador visual actualizado

---

### Phase 10: Deploy & hardening
**Goal:** El panel está disponible en una URL pública del workspace de Zivelo. Variables de entorno configuradas. Acceso restringido a usuarios del workspace.
**Mode:** mvp
**Requirements:** DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria:**
1. Panel accesible en URL pública (dominio Zivelo o Vercel)
2. Supabase URL y anon key configuradas como variables de entorno (no hardcodeadas)
3. Intentar acceder sin sesión → redirect a Login, no se muestran datos
