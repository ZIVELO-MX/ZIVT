# Zivelo Panel — Product Roadmap & Auditoría

**Rol del documento:** roadmap de producto versionado (v0.1 → v1.0 → Futuro), auditoría del estado actual y modelo de datos objetivo.
**Relación con `.planning/ROADMAP.md`:** aquel documento es el plan de *ejecución técnica* (fases 1–10 para conectar la UI a Supabase). Este documento es el plan de *producto*: define qué es la herramienta, qué versiones existen y qué no se construye.

*Última actualización: 2026-06-09 (rev. 4 — mueve invitación a later, agrega plan visual prototype)*

---

## 1. Diagnóstico del producto

**Qué es hoy:** una UI completa (Next.js + Tailwind + Supabase) con 6 vistas — Dashboard, Kanban, Proyectos, Clientes, Usuarios, Aprendizaje — con **auth real (Supabase `signInWithPassword`), middleware de protección de rutas (`proxy.ts`), logout real y datos cargados desde Supabase con realtime (`useAppData`)**. Los mocks de `lib/data.ts` fueron eliminados de main.

**Diagnóstico en una frase:** la base de confiabilidad (auth + datos reales) ya está; la profundidad que falta es de producto: vistas alternativas, import/export, trazabilidad y finanzas operativas.

**Los problemas estructurales (estado):**

1. ~~**Auth mock.**~~ **Resuelto en main + PR #10:** login real, middleware, logout y restricción al dominio Zoho (`feat/auth-domain-guard`). Pendiente de v0.1: flujo de invitación desde el sidebar, reset de contraseña y prueba de RLS con usuarios reales de cada rol.
2. **Una sola vista de trabajo.** Todo vive en el Kanban; no hay vista lista/tabla ni calendario, y los filtros existen solo en el tablero.
3. **Los datos no entran ni salen.** No hay export CSV/JSON funcional (el botón existe sin handler) ni import de ningún tipo. Para una herramienta interna, import/export es lo que evita el lock-in del propio equipo.
4. **Cero noción financiera a nivel de tarea.** Los proyectos tienen `budget`/`spent` y los clientes tienen `mrr`, pero ninguna tarea puede costar ni generar dinero, y no existen movimientos, gastos, pagos ni reportes. Este es el diferenciador pedido y hoy no existe nada de él.

**Riesgo de scope:** Zivelo ya tiene una herramienta interna de presupuestos. Este panel **no debe** convertirse en sistema contable. Su rol financiero es *finanzas operativas ligeras*: registrar que una tarea costó o generó dinero, con evidencia, y reportarlo. Nada de contabilidad de doble partida, facturación ni impuestos.

---

## 2. Alcance del producto

### Qué ES

- Panel operativo interno **exclusivo del equipo Zivelo** (5–7 personas, acceso por invitación con cuentas Zoho).
- Centro de trabajo diario: tareas en Kanban / lista / calendario, proyectos, clientes y equipo.
- Registro **operativo** de dinero ligado al trabajo: "esta tarea costó $X", "este entregable generó $Y", "este gasto se pagó el día Z con esta evidencia".
- Fuente de reportes simples para decisiones del equipo (no para el contador).

### Qué NO ES

- ❌ Un SaaS para clientes externos. No hay multi-tenant, ni billing, ni acceso de terceros.
- ❌ Un sistema de presupuestos. Eso ya existe en otra herramienta Zivelo; este panel puede *referenciar* un presupuesto (campo de enlace/nota), nunca gestionarlo.
- ❌ Un sistema contable: sin plan de cuentas, sin doble partida, sin conciliación bancaria, sin impuestos, sin nómina, sin facturación.
- ❌ Un gestor de aprobaciones complejas: a lo sumo un estado `pending → paid` con quién lo registró.

### Frontera con la herramienta de presupuestos

| Pregunta | Este panel | Herramienta de presupuestos |
|---|---|---|
| ¿Cuánto cuesta/genera esta **tarea**? | ✅ | ❌ |
| ¿Quién pagó qué y cuándo (operativo)? | ✅ | ❌ |
| ¿Cuál es el presupuesto del **proyecto/cliente**? | Solo lectura/referencia | ✅ dueño del dato |
| Proyección, partidas, aprobación de presupuesto | ❌ | ✅ |
| Reportes contables/fiscales | ❌ | ✅ (o el contador) |

Regla práctica: **si el dato vive a nivel tarea o movimiento puntual, es de este panel; si vive a nivel presupuesto o ejercicio contable, es de la otra herramienta.**

---

## 3. Roadmap por versiones (resumen)

| Versión | Objetivo | Incluye | Excluye explícitamente |
|---|---|---|---|
| **v0.1** | Base confiable: auth real + Kanban persistente | Login Supabase restringido a dominio Zoho, sesión/logout, RLS efectivo, Kanban CRUD real, permisos básicos (founder/admin/editor/viewer ya modelados), deploy interno | Finanzas, import/export, calendario, lista |
| **v0.2** | Ver y sacar datos | Vista lista/tabla, filtros y búsqueda globales, export CSV/JSON filtrado, mejoras Kanban (menú de columna, subtareas, comentarios persistentes) | Import, finanzas, calendario |
| **v0.3** | Meter datos + trazabilidad | Vista calendario, import CSV/JSON con validación y reporte de errores, audit log básico, panel de configuración interna | Finanzas, reportes |
| **v1.0** | Finanzas operativas ligeras | Campos financieros en tareas, gastos, pagos, movimientos, reportes básicos (por proyecto/mes/categoría), export financiero | Contabilidad, facturación, impuestos, nómina |
| **Futuro** | Solo si duele su ausencia | Zoho OAuth nativo, automatizaciones, integración con herramienta de presupuestos, adjuntos en storage, app móvil, workflows de aprobación | — |

---

## 4. Checklist de auditoría

### ✅ Ya existe (funcional o con camino real)

- [x] UI completa: Dashboard, Kanban (drag & drop, 5 columnas), Proyectos, Clientes, Usuarios, Aprendizaje
- [x] Schema Supabase: `profiles`, `projects`, `tasks`, `clients`, `notifications`, `learning_tasks` (migraciones 001–005)
- [x] RLS definido (migración 002) y modelo de permisos en datos (`permission: founder|admin|editor|viewer`)
- [x] Capa de queries tipada (`lib/supabase/queries.ts`, `types.ts`) con CRUD de proyectos/tareas/clientes
- [x] Hook `useRole()` para render condicional por rol
- [x] Dark mode, command palette ⌘K, sidebar colapsable, drawers de detalle

### ❌ Falta (y bloquea o degrada el uso real)

**Técnico**
- [x] **Login real** — resuelto en main: `signInWithPassword` en `app/login/page.tsx`
- [x] Restricción al dominio Zoho — resuelto en PR #10: guard en `proxy.ts` + pre-check en login (`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`)
- [x] Logout real — resuelto en main (`auth.signOut`); PR #10 corrigió que borraba preferencias de dispositivo
- [x] Middleware de protección de rutas — resuelto en main (`proxy.ts`)
- [x] UI lee de Supabase — `lib/data.ts` eliminado en main; `useAppData` con realtime
- [ ] Flujo de reset de contraseña (hoy: pedir reset al admin desde Supabase Studio)
- [ ] Flujo de invitación al equipo (requiere service-role key o Edge Function — ver Pendientes bloqueados)

**Producto**
- [x] **Vista lista/tabla de tareas** — implementada en PR #12: `components/tasks-list.tsx` con columnas sortables, edición inline de estado/asignados, vista mobile en cards
- [ ] Vista calendario
- [x] **Export CSV/JSON** — modal unificado con toggle CSV↔JSON, preview de primeras 10 filas, Descargar y Copiar; disponible en Kanban y Lista
- [ ] Import CSV/JSON (UI con textarea para pegar + validación de formato lista, falta import real a Supabase)
- [ ] Campos financieros en tareas, gastos, pagos, reportes
- [x] **Búsqueda y filtros fuera del Kanban** — FiltersDrawer reutilizado en Lista (tags, prioridad, vencimiento, asignados, orden)
- [ ] **Renombrar columnas del Kanban** — permitir al usuario cambiar los nombres de las columnas (todo, progress, review, done, blocked) desde la UI

**UX** (inventario completo en `BOTONES-SIN-FUNCIONALIDAD.md` — 28 elementos sin handler)
- [ ] Guardar cambios en TaskDetail no persiste; subtareas y comentarios no se pueden crear
- [ ] Menús contextuales `⋯` de columnas y proyectos vacíos
- [ ] Invitar al equipo, Configuración, ítems del menú de usuario sin acción
- [x] **Skeleton / loading states** — implementado en Kanban y TaskList (PR #12); componente `<Skeleton>` con 7 variantes; `useAppData` expone `loading`
- [x] **Botón "Prompt IA"** — en el modal Exportar/Importar, pestaña Prompt IA: selector de proyecto + `project_id` en schema, instrucción editable, copia prompt en inglés con contexto realista
- [ ] **Estilo de dropdowns y animaciones** — los `<select>` del modal Exportar y filtros no tienen estilo coherente; falta animación suave en botones (hover, active, toggle) en toda la app

**Datos**
- [ ] Sin tabla de tags (hoy `tag` es un string suelto en task)
- [ ] Sin entidades financieras (movements/expenses/payments)
- [ ] Sin audit log (¿quién movió/borró qué?)
- [ ] Sin import/export jobs
- [ ] `assignee` y `team` son `text[]` sin FK a `profiles` — integridad débil

**Operacional**
- [ ] Deploy estable (root directory de Vercel recién configurado, sin verificar)
- [ ] Sin backups documentados ni proceso de restore
- [ ] Sin onboarding del equipo (¿quién invita, cómo se asigna rol?)
- [ ] Sin tests automatizados — PR #10 introduce Vitest con los primeros tests (`lib/auth-domain`, `exportToCSV`); falta cubrir queries y componentes

### ⏸️ No construir todavía (decidido, ver sección 9)

- Contabilidad completa, facturación, impuestos, nómina
- Permisos avanzados (por board, por campo, custom roles)
- Acceso de clientes externos
- Workflows de aprobación multi-paso
- Multi-workspace

### 🔮 Pertenece a una versión futura (válido, pero después de v1.0)

- Zoho OAuth/OIDC nativo (v0.1 usa email del dominio Zoho vía Supabase Auth, que es suficiente)
- Adjuntos de evidencia en Supabase Storage (v1.0 arranca con `evidence_url` como link)
- Integración de solo-lectura con la herramienta de presupuestos
- Automatizaciones (recordatorios de pago, tareas recurrentes)

---

## 5. Modelo de datos sugerido

Principio: **evolucionar el schema actual, no reemplazarlo.** Lo existente se mantiene; lo nuevo se agrega por versión. Un solo workspace (Zivelo) — no se modela tabla `workspaces`; la configuración global vive en `app_settings`.

```
profiles (existe)            ← User. Agregar: email (copia de auth), is_active
app_settings (v0.3)          ← Configuración interna (1 fila): moneda default,
                               categorías de gasto permitidas, dominio permitido

boards (v0.2)                ← id, name, kind ('work'|'learning'), position
board_columns (v0.2)         ← id, board_id FK, name, key, position, color
                               (reemplaza el CHECK fijo de tasks.col)

tasks (existe, evoluciona)   ← Agregar en v0.2: board_id FK, column_id FK,
                               position (orden en columna), description,
                               created_by FK profiles
                               Agregar en v1.0: campos financieros (sección 6)
task_assignees (v0.2)        ← task_id FK, profile_id FK (reemplaza text[])
tags (v0.2)                  ← id, name, color
task_tags (v0.2)             ← task_id FK, tag_id FK

projects (existe)            ← Agregar: budget_ref text (link a la herramienta
                               de presupuestos, solo referencia)
clients (existe)

-- Finanzas operativas (v1.0) --
financial_movements          ← id, kind ('expense'|'payment'|'income'),
                               task_id FK null, project_id FK null,
                               amount numeric, currency text,
                               category text, status ('pending'|'paid'|'cancelled'),
                               paid_by FK profiles null, paid_to text,
                               movement_date date, evidence_url text,
                               notes text, created_by FK, created_at
  -- Un gasto ES un movement kind='expense'; un pago ES kind='payment'.
  -- Una sola tabla evita el clásico join triple para "todo el dinero del mes".

report_definitions (v1.0)    ← id, name, kind ('by_project'|'by_month'|
                               'by_category'|'by_person'), filters jsonb,
                               created_by FK
  -- Los reportes se calculan en vivo desde movements; no se materializan.

-- Trazabilidad (v0.3) --
audit_log                    ← id, actor_id FK profiles, entity_type text,
                               entity_id text, action ('create'|'update'|
                               'delete'|'move'), changes jsonb, created_at
import_jobs                  ← id, kind ('csv'|'json'), target ('tasks'|...),
                               status ('pending'|'done'|'failed'),
                               total_rows int, ok_rows int, error_rows int,
                               errors jsonb, created_by FK, created_at
export_jobs                  ← id, kind, target, filters jsonb,
                               row_count int, created_by FK, created_at
  -- export_jobs es solo bitácora (el archivo se genera client-side y se
  -- descarga); no almacenar el archivo.

notifications (existe)
learning_tasks (existe)      ← Migrar a boards/kind='learning' en v0.2
                               o dejar como está si no molesta.
```

Notas de realismo:

- **No** crear `expenses` y `payments` como tablas separadas: para un equipo de 5–7 personas, `financial_movements.kind` es suficiente y los reportes salen de una sola tabla.
- **No** materializar reportes: con cientos o pocos miles de movimientos, un `SELECT ... GROUP BY` en vivo sobra.
- `audit_log` se llena desde la capa de queries (no triggers al inicio): menos mágico, más debuggeable. Si se queda corto, migrar a triggers en Futuro.

---

## 6. Campos financieros de tareas (v1.0)

Diseño en dos niveles: **resumen en la tarea** (para verlo en la tarjeta/lista sin joins) + **detalle en `financial_movements`** (la fuente de verdad de cada pago/gasto).

Campos nuevos en `tasks`:

| Campo | Tipo | Valores / notas |
|---|---|---|
| `financial_type` | text | `'none'` (default) \| `'cost'` \| `'income'` \| `'mixed'` |
| `estimated_amount` | numeric | Estimado al crear; null si `none` |
| `actual_amount` | numeric | Derivado: suma de movements vinculados (mantenido por la app) |
| `currency` | text | Default desde `app_settings`; ISO 4217 (`'USD'`, `'MXN'`, …) |
| `payment_status` | text | `'n/a'` \| `'pending'` \| `'partial'` \| `'paid'` |

El resto vive en `financial_movements` ligados a la tarea:

| Campo (movement) | Para qué |
|---|---|
| `kind` | `expense` (la tarea costó) / `income` (la tarea generó) / `payment` (salida de dinero concreta) |
| `category` | Categoría de gasto (`software`, `freelance`, `ads`, `equipo`, …) — lista editable en `app_settings` |
| `paid_by` | Quién del equipo pagó (FK a profiles) |
| `paid_to` | A quién se pagó (texto libre: proveedor, freelancer) |
| `movement_date` | Fecha real del movimiento |
| `evidence_url` | Link a comprobante (Drive/Zoho); adjuntos reales = Futuro |
| `notes` | Texto libre |

Reglas:

- Una tarea con `financial_type = 'none'` no muestra nada financiero en la UI (cero ruido para el 80 % de tareas).
- `actual_amount` y `payment_status` se recalculan al crear/editar/borrar un movement vinculado — nunca se editan a mano.
- Solo `founder`/`admin` ven montos (consistente con la regla de confidencialidad ya definida en Phase 7 del roadmap técnico); `editor` puede marcar que una tarea "tiene impacto financiero" sin ver cifras.

---

## 7. Detalle por versión

### v0.1 — Base confiable *(primera release interna usable)*

- **Objetivo:** que el equipo Zivelo entre con su cuenta real y use el Kanban con datos persistentes, sin nada mock en el camino crítico.
- **Incluye:**
  - Supabase Auth real: login email+contraseña con cuentas del dominio Zoho de Zivelo (allowlist de dominio en signup/invite), sesión, logout real, middleware de protección de rutas
  - Kanban 100 % real: crear/mover/editar/eliminar persiste; "Guardar cambios" de TaskDetail funciona; subtareas y comentarios persisten
  - Permisos básicos efectivos: RLS verificado por rol, sidebar y vistas condicionadas por `useRole()`
  - Invitar al equipo (botón del sidebar → invite de Supabase)
  - Deploy estable en Vercel con env vars
- **Excluye:** export/import, lista, calendario, finanzas, audit log, Zoho OAuth nativo.
- **Dependencias:** proyecto Supabase configurado; cuentas Zoho del equipo conocidas.
- **Riesgos:** (1) la UI puede seguir leyendo mocks de `lib/data.ts` en vistas no auditadas — verificar vista por vista; (2) RLS mal probado da falsa seguridad — testear con un usuario `viewer` real.
- **Criterios de aceptación:**
  1. Un miembro con email Zoho invitado entra, ve el Kanban, mueve una tarjeta, recarga y persiste.
  2. Un email fuera del dominio no puede registrarse ni ser invitado.
  3. Sin sesión, toda ruta redirige a `/login`; logout destruye la sesión.
  4. Un `viewer` no ve Clientes ni KPIs financieros (MRR).
- **Cambios de modelo:** agregar `email` y `created_by` donde falte; sin tablas nuevas.

### v0.2 — Ver y sacar datos

- **Objetivo:** que el trabajo se pueda ver como tabla, filtrar globalmente y exportar.
- **Incluye:**
  - Vista lista/tabla de tareas: columnas ordenables (título, proyecto, estado, asignado, due, prioridad), edición inline de estado/asignado
  - Filtros y búsqueda compartidos entre Kanban y lista (proyecto, asignado, tag, prioridad, rango de fechas, texto)
  - Export CSV y JSON **de lo filtrado** (tareas y clientes), generado client-side, registrado en `export_jobs`
  - Kanban: menú contextual de columna, reordenar dentro de columna (`position`)
- **Excluye:** import, calendario, finanzas.
- **Dependencias:** v0.1 (filtros por asignado requieren `task_assignees` con FK reales).
- **Riesgos:** la migración `assignee text[] → task_assignees` toca datos vivos — hacer con script de backfill y verificación.
- **Criterios de aceptación:**
  1. La misma combinación de filtros produce el mismo conjunto en Kanban, lista y export.
  2. El CSV exportado se reabre en Excel/Sheets sin columnas rotas (escaping correcto).
  3. Reordenar tarjetas dentro de una columna persiste tras recarga.
- **Cambios de modelo:** `boards`, `board_columns`, `task_assignees`, `tags`, `task_tags`, `tasks.position`, `export_jobs`.

### v0.3 — Meter datos + trazabilidad

- **Objetivo:** que los datos entren de forma segura y que todo cambio tenga autor.
- **Incluye:**
  - Vista calendario (mensual/semanal) por `due date`, con drag para re-fechar
  - Import CSV/JSON de tareas: preview antes de confirmar, validación fila por fila, reporte de errores (`import_jobs`), idempotencia por id externo opcional
  - Audit log básico: quién creó/movió/editó/borró tareas, proyectos y clientes; vista de historial en el drawer de la entidad (solo admin+)
  - Configuración interna (`app_settings`): moneda default, categorías de gasto (preparación para v1.0), dominio permitido
- **Excluye:** finanzas visibles, reportes.
- **Dependencias:** v0.2 (el import escribe contra el modelo nuevo de boards/assignees).
- **Riesgos:** import es el feature con más esquinas (encodings, fechas, duplicados) — limitar a un formato documentado con plantilla descargable.
- **Criterios de aceptación:**
  1. Importar un CSV con 2 filas malas importa las buenas y reporta las 2 con motivo y número de fila.
  2. Re-fechar una tarea desde el calendario persiste y aparece en el audit log con autor.
  3. Cada create/update/delete de tarea genera entrada en `audit_log`.
- **Cambios de modelo:** `audit_log`, `import_jobs`, `app_settings`.

### v1.0 — Finanzas operativas ligeras

- **Objetivo:** que el equipo sepa cuánto cuesta y cuánto genera su trabajo, a nivel operativo, sin convertirse en contabilidad.
- **Incluye:**
  - Campos financieros en tareas (sección 6) + sección financiera en TaskDetail (solo founder/admin)
  - Registro de movimientos: gastos y pagos con categoría, evidencia (URL), fecha, quién pagó
  - Movimientos sueltos (no ligados a tarea) para gastos generales del equipo
  - Reportes básicos en vivo: por proyecto, por mes, por categoría, por persona; cada reporte exportable a CSV/JSON con los filtros aplicados
  - `payment_status` visible como chip en tarjetas/lista para founder/admin
- **Excluye:** facturación, impuestos, nómina, conciliación, aprobaciones multi-paso, adjuntos en storage, sincronización con la herramienta de presupuestos.
- **Dependencias:** v0.3 (`app_settings` para moneda/categorías; `audit_log` porque tocar dinero sin trazabilidad es inaceptable).
- **Riesgos:** *scope creep contable* — la defensa es la regla de frontera de la sección 2: si alguien pide "partidas presupuestales" o "factura", la respuesta es la otra herramienta. Segundo riesgo: confidencialidad — testear RLS de `financial_movements` con usuario `editor` antes de cargar datos reales.
- **Criterios de aceptación:**
  1. Una tarea marcada `cost` con 2 gastos vinculados muestra `actual_amount` = suma y `payment_status` correcto.
  2. Un `editor` no puede leer `financial_movements` ni por API directa (RLS, no solo UI).
  3. El reporte "gastos por categoría del mes" cuadra con la suma manual de movements y se exporta a CSV.
  4. Todo movement creado/editado/borrado queda en `audit_log`.
- **Cambios de modelo:** `financial_movements`, `report_definitions`, campos financieros en `tasks`, `projects.budget_ref`.

### Futuro / Después

Zoho OAuth nativo · adjuntos en Supabase Storage · integración lectura con herramienta de presupuestos · automatizaciones (recordatorios de pago, recurrencias) · tareas recurrentes · app móvil · webhooks.

---

## 8. Primera release interna usable

**Es v0.1, y nada más que v0.1.** La prueba de fuego: *el lunes el equipo abre el panel con su cuenta Zoho, trabaja el Kanban toda la semana y nada se pierde ni se ve lo que no debe.* Todo lo demás (export, calendario, finanzas) es valioso pero no condiciona que la herramienta se adopte; un login mock sí condiciona que no se use jamás con datos reales.

---

## 9. No construir todavía

| Qué | Por qué no | Cuándo reconsiderar |
|---|---|---|
| Contabilidad completa (doble partida, plan de cuentas) | Existe contador/herramienta externa; ROI nulo para 5–7 personas | Probablemente nunca |
| Facturación | No es el caso de uso; Zoho ya factura | Nunca en este panel |
| Impuestos | Dominio del contador | Nunca en este panel |
| Nómina | Dominio sensible, legal, fuera de alcance | Nunca en este panel |
| Sistema de presupuestos | **Ya existe otra herramienta Zivelo** — solo referenciar vía `budget_ref` | Integración de lectura, post-v1.0 |
| Permisos avanzados (por board/campo, roles custom) | 4 roles fijos cubren a 7 personas | Si el equipo pasa de ~15 |
| Acceso de clientes externos | Es herramienta interna por definición | Si cambia la definición del producto |
| Workflows de aprobación multi-paso | `pending → paid` + audit log basta | Si los montos crecen y duele |
| Multi-workspace | Un solo Zivelo | Nunca previsible |
| Zoho OAuth/OIDC | Email del dominio Zoho vía Supabase da el 95 % del valor con 5 % del esfuerzo | Post-v1.0 si el login con contraseña molesta |
| Invitación automática al equipo | No es crítica para el uso diario; invitar manual desde Supabase Studio funciona para el equipo actual de 5–7 personas | Si el equipo crece >10 y el proceso manual deja de escalar |

---

## 10. Próximas 4 tareas de implementación

1. ~~Conectar el login a Supabase Auth~~ — **hecho en main** (login, logout, middleware `proxy.ts`).
2. ~~Restringir acceso al dominio Zoho~~ — **hecho en PR #10** (`feat/auth-domain-guard`).
3. **Probar RLS con usuarios reales de cada rol:** crear un usuario `editor` y un `viewer` de prueba y verificar que Clientes/MRR quedan inaccesibles por API, no solo ocultos en UI. *(v0.1, requiere acceso a Supabase Studio)*
4. **Verificar el deploy de Vercel** (root directory `.`, env vars incl. `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`) y dejar URL interna estable documentada en el README. *(v0.1, requiere acceso al dashboard de Vercel)*

---

## 11. Registro de refactors y fixes

*Código mejorado durante la auditoría (PR #10, rama `feat/auth-domain-guard`):*

- **Fix logout (`components/modals/user-menu.tsx`):** el logout borraba las preferencias de dispositivo (`zivelo-dark`, `zivelo-sidebar`, `zivelo-density`) y una key inexistente `zivelo-remember` — el login guarda `zivelo-remember-email`, así que esa línea no hacía nada. Ahora el logout solo cierra sesión; las preferencias sobreviven entre sesiones.
- **UI muerta eliminada del login:** botones SSO Google/GitHub sin `onClick` (OAuth es Futuro según este roadmap), link "¿Olvidaste tu contraseña?" a `href="#"` (reemplazado por texto "pide reset al admin" hasta que exista el flujo) y links del footer a `#`.
- **Deuda detectada, no tocada aún:** `useAppData.teams: any[]` es un leftover sin uso real; varios componentes tipan props como `any` (`user-menu.tsx`, otros modales). Candidatos a refactor cuando se toque cada archivo.

## 12. Pendientes bloqueados (saltados y documentados)

| Pendiente | Por qué está bloqueado | Qué se necesita |
|---|---|---|
| Confirmar el dominio Zoho real | Asumí `zivelo.mx` en `.env.example` | Confirmación del equipo; configurar `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` en Vercel |
| Flujo de invitación al equipo | `auth.admin.inviteUserByEmail` requiere service-role key que no debe ir al cliente | Edge Function o route handler server-side + `SUPABASE_SERVICE_ROLE_KEY` en Vercel |
| Flujo de reset de contraseña | Requiere página `/auth/reset` + configurar redirect URL en Supabase | Decisión de UX + acceso a config de Supabase Auth |
| Prueba de RLS por rol | Requiere crear usuarios de prueba en el proyecto Supabase real | Acceso a Supabase Studio |
| Verificación del deploy | Requiere acceso al dashboard de Vercel | Acceso al proyecto en Vercel |
| Skeleton / loading states audit | Varias vistas cargan sin feedback visual | Ver sección 13 |

## 13. Auditoría de skeleton / loading states

**Regla:** Todo componente que carga datos desde Supabase debe mostrar un estado de carga (skeleton) antes de que los datos lleguen. Sin excepción. Componentes nuevos deben incluir skeleton desde su creación.

### Estado actual por vista

| Vista / componente | Tiene skeleton? | Notas |
|---|---|---|
| `Dashboard` (dashboard.tsx) | ❌ | Carga de golpe, sin placeholder |
| `Kanban` (kanban.tsx) | ❌ | Muestra columnas vacías hasta que llegan datos |
| `TaskList` (tasks-list.tsx) | ❌ | Nueva — debe tener skeleton desde inicio |
| `Projects` (projects.tsx) | ❌ | Sin skeleton |
| `Clients` (clients.tsx) | ❌ | Sin skeleton |
| `Users` (users.tsx) | ❌ | Sin skeleton |
| `Settings` (settings.tsx) | ❌ | Sin skeleton |
| `Profile` (profile.tsx) | ❌ | Sin skeleton |
| `Learning` (learning.tsx) | ❌ | Sin skeleton |
| `Login` (login/page.tsx) | ❌ | Botón submit sin estado "enviando" |
| Sidebar / Topbar | ❌ | Avatar de usuario sin skeleton |
| NotificationsDrawer | ❌ | Sin skeleton |
| TaskDetail | ❌ | Drawer sin skeleton mientras carga comments |
| CommandPalette | ❌ | Sin skeleton en resultados de búsqueda |

### Implementación

- Crear componente `Skeleton` reutilizable en `components/ui.tsx` (variantes: `text`, `avatar`, `card`, `table-row`, `kanban-card`)
- Cada vista envuelve su contenido en un conditional: `if (loading) return <Skeleton variant="..." />`
- Usar animación `pulse` de Tailwind (ya existe en el código como `animate-pulse`)
- Prioridad: Kanban, TaskList, Dashboard → Clients, Projects, Users → resto

## 14. Botón "Copiar prompt IA"

**Propósito:** Que el usuario pueda copiar al portapapeles un prompt descriptivo del formato de datos que exporta, para pegarlo en una IA (Claude, GPT, etc.) y recibir código/scripts que procesen esos datos correctamente.

### Ubicación
- Botón junto a los botones de export CSV/JSON en TaskList y Clients
- `📋 Copiar prompt IA`

### Formato del prompt copiado
```
Exporté {n} registros de {vista} desde Zivelo Panel.
El formato es {CSV|JSON} con estas columnas/tipos:
{lista de campos con tipos}

Necesito que {descripción de lo que debe hacer la IA con estos datos},
respetando exactamente estos nombres de campo y tipos.
Devuelve solo el código/script listo para ejecutar, sin explicaciones.
```

### Implementación técnica
- Botón que abre un pequeño modal/drawer con:
  - Selector de formato: CSV | JSON
  - Textarea para la instrucción (ej: "genera un gráfico de barras", "calcula totales por proyecto", "transforma a SQL INSERT")
  - Botón "Copiar prompt" que genera el texto completo, lo copia al portapapeles y muestra feedback visual "✓ Copiado"
- El prompt generado incluye:
  - Metadatos: nº de registros, vista de origen, fecha de exportación
  - Schema: lista de campos con tipo de dato (string, number, date, etc.)
  - Instrucción del usuario
  - Ejemplo de 2 filas reales para contexto

---

## 15. Especificación: Issues tipo Jira para el Roadmap

**Propósito:** Agregar al Roadmap del producto una entidad `roadmap_item` que funcione como issue/ticket tipo Jira, con descripción enriquecida, comentarios, subtareas, adjuntos, labels y trazabilidad. Sirve para planificación estratégica a mediano plazo, separada de las tareas diarias del Kanban.

**Relación con el modelo existente:** `roadmap_items` es una entidad *nueva*. No reemplaza a `tasks` (que sigue siendo el bloque diario). Un `roadmap_item` representa un objetivo, épica o iniciativa que puede dar origen a varias `tasks` concretas.

### 15.1 Objetivos

1. **Planear con contexto:** cada item del roadmap tiene una descripción rica (Markdown) donde documentar motivación, alcance y criterios de aceptación.
2. **Debatir sin ruido:** comments dentro del item, sin mezclarse con el Kanban diario.
3. **Dividir para vencer:** subtareas tipo checklist que fragmentan el item en pasos verificables.
4. **Adjuntar evidencia:** archivos/links de GitHub, Drive, o cualquier URL.
5. **Trazar progreso:** estado claro (backlog → done) y prioridad, visibles de un vistazo.

### 15.2 Propuesta de esquema de datos

Se usa Postgres con columnas `jsonb` para datos semiestructurados (comments, subtasks, attachments). Esto evita tablas extra y permite queries flexibles.

```sql
create table if not exists public.roadmap_items (
  id          text primary key,
  title       text not null,                          -- descripción breve
  description jsonb default '{"text":""}',            -- Markdown enriquecido
  status      text default 'backlog'
                check (status in ('backlog','planned','in_progress','review','done','cancelled')),
  priority    text default 'med'
                check (priority in ('low','med','high','critical')),
  assignee    text[] default '{}',                     -- ids de perfiles
  labels      text[] default '{}',                     -- tags libres
  project     text,                                    -- FK opcional a projects
  epic        text,                                    -- grouping de items
  due         date,
  attachments jsonb default '[]',                      -- [{id, name, url, type, size}]
  subtasks    jsonb default '[]',                      -- [{id, title, done}]
  comments    jsonb default '[]',                      -- [{id, author, body, createdAt}]
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

**Notas:**
- `description` se guarda como `{"text": "..."}` para permitir migrar a un modelo más rico después (e.g. `{"text": "...", "html": "...", "mentions": [...]}`).
- `attachments` soporta cualquier URL (GitHub, Drive, Figma, etc.). La validación de que la URL exista es responsabilidad del usuario.
- `comments` almacena autor (profile id), body (texto con Markdown) y timestamp. Suficiente para un equipo de <10 personas; si escala, migrar a tabla separada.
- `subtasks` son checklist planos: `{id, title, done}`. Sin anidamiento.

### 15.3 Propuesta de tecnología

| Aspecto | Propuesta | Objetivo (por qué, no cómo) |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 — stack existente | Consistencia con el resto del panel |
| Base de datos | Supabase/Postgres con `jsonb` — stack existente | Sin infraestructura nueva |
| ORM / acceso a datos | **Prisma** (agregar al proyecto) o Supabase JS client directo | Capa de datos tipada, migraciones declarativas, DX con autocompletado |
| Editor enriquecido | `@uiw/react-md-editor` o `react-simplemde-editor` | Escribir Markdown con preview en vivo; evitar construir un editor desde cero |
| UI de board | Kanban nativo (como el existente) con drag & drop entre columnas | Reutilizar patrón de `components/kanban.tsx` ya probado |
| Almacenamiento de archivos | Supabase Storage o solo URLs de referencia | Adjuntar evidencia sin subir archivos pesados al servidor; si se necesita storage real, será Futuro |
| Rich text en comments | Markdown renderizado con `react-markdown` + `remark-gfm` | Mostrar comments con formato sin permitir HTML peligroso |

### 15.4 Paso a paso para implementar

1. **Migración de base de datos**
   - Crear la tabla `roadmap_items` vía migración SQL (`supabase/migrations/006_roadmap_items.sql`).
   - Agregar trigger `updated_at`.
   - Agregar política RLS básica (solo `founder`/`admin`/`editor` pueden escribir; `viewer` solo lectura).

2. **Tipos TypeScript**
   - Agregar `RoadmapStatus`, `RoadmapPriority`, `RoadmapAttachment`, `RoadmapSubtask`, `RoadmapComment`, `RoadmapItem` a `lib/supabase/schema.ts`.
   - Agregar mapper functions (`roadmapItemRowToRoadmapItem`, `roadmapItemToRoadmapItemRow`) a `lib/supabase/types.ts`.
   - Exportar tipos desde el barrel.

3. **Queries CRUD**
   - Agregar `getRoadmapItems`, `createRoadmapItem`, `updateRoadmapItem`, `deleteRoadmapItem` a `lib/supabase/queries.ts`.
   - Integrar en `useAppData` con realtime (subscription `postgres_changes` para `roadmap_items`).

4. **Constantes**
   - Agregar `ROADMAP_COLS` (backlog, planned, in_progress, review, done, cancelled) a `lib/constants.ts`.
   - Agregar `ROADMAP_PRIORITY` y `ROADMAP_STATUS` labels.

5. **Componente `Roadmap`**
   - Crear `components/roadmap.tsx` con:
     - Board Kanban de 6 columnas, drag & drop entre columnas.
     - Detail drawer con:
       - Título editable.
       - Descripción Markdown con editor/preview.
       - Subtareas (checklist) con toggle y creación inline.
       - Comentarios (lista + input para agregar).
       - Adjuntos (lista + URL input para agregar).
       - Labels, assignees, proyecto, épica.
     - Modal de nuevo item.
     - Skeleton loading state.

6. **Integrar en la app**
   - Agregar `'roadmap'` a `VALID_VIEWS` en `app/page.tsx`.
   - Renderizar `<Roadmap>` condicionalmente.
   - Agregar NavItem en `sidebar.tsx` (icono `Ic.Map` o `Ic.Sparkle`).
   - Agregar entrada en `TOPBAR_TITLES`.

7. **Pruebas**
   - Test unitario de mappers (`roadmapItemRowToRoadmapItem`).
   - Test de queries con Supabase local.
   - Verificar RLS visualmente con usuario `viewer`.

### 15.5 Criterios de aceptación

1. Un usuario puede crear un item del roadmap con título, descripción Markdown, labels y prioridad.
2. El item se puede mover entre columnas (backlog → planned → in_progress → review → done) con drag & drop.
3. La descripción se renderiza como Markdown formateado y es editable.
4. Se pueden agregar/quitar subtareas con toggle de completado.
5. Se pueden agregar comentarios con autor y timestamp.
6. Se pueden adjuntar URLs de referencia (GitHub, Drive, etc.).
7. Los datos persisten en Supabase y se reflejan en tiempo real en todos los clientes.
8. Un usuario `viewer` puede ver items pero no crearlos/editarlos (validado por RLS).

### 15.6 Plan de implementación visual (prototipo sin DB)

**Cuándo:** antes de que exista la migración de base de datos, para validar UX con el equipo.

**Alcance:**
- Componente `components/roadmap.tsx` con estado en `useState` (sin persistencia).
- Mock data con 5–6 items de ejemplo distribuidos en las 6 columnas.
- Kanban board con drag & drop entre columnas (reutilizar patrón de `learning.tsx`).
- Detail drawer modal con: título editable, descripción en textarea (Markdown plano), subtareas checklist, comentarios, adjuntos por URL, labels con tags, asignación de perfiles.
- Modal de nuevo item con formulario completo.
- Sin llamadas a Supabase — toda la mutación es local.

**No incluye** (se hará cuando exista la migración):
- Persistencia en BD.
- Realtime.
- RLS.
- Editor Markdown con preview en vivo.
- Subida de archivos a Storage.
