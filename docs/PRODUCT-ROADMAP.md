# Zivelo Panel — Product Roadmap & Auditoría

**Rol del documento:** roadmap de producto versionado (v0.1 → v1.0 → Futuro), auditoría del estado actual y modelo de datos objetivo.
**Relación con `.planning/ROADMAP.md`:** aquel documento es el plan de *ejecución técnica* (fases 1–10 para conectar la UI a Supabase). Este documento es el plan de *producto*: define qué es la herramienta, qué versiones existen y qué no se construye.

*Última actualización: 2026-06-09*

---

## 1. Diagnóstico del producto

**Qué es hoy:** una UI completa (Next.js + Tailwind + Supabase) con 6 vistas — Dashboard, Kanban, Proyectos, Clientes, Usuarios, Aprendizaje — donde **solo el Kanban y los CRUD básicos tienen camino real a persistencia** (migraciones y queries existen), pero **el login sigue siendo mock**, lo que significa que en la práctica nada está protegido ni atribuido a un usuario real.

**Diagnóstico en una frase:** la herramienta tiene *amplitud* de UI pero *profundidad* cero en las capas que la hacen confiable: autenticación, permisos efectivos, historial y datos financieros operativos.

**Los 4 problemas estructurales:**

1. **Auth mock = producto no usable.** Cualquier release interna requiere login real con las cuentas Zoho del equipo. Es el bloqueante número uno.
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
- [ ] **Login real** — el submit es un mock con delay de 700 ms (`app/login/page.tsx`); bloqueante absoluto
- [ ] Restricción de registro al dominio Zoho de Zivelo (allowlist de dominio o invitación)
- [ ] Logout real (hoy solo navega a `/login` sin destruir sesión)
- [ ] Middleware de protección de rutas (redirect sin sesión)
- [ ] Verificación de que la UI realmente lee de Supabase y no de `lib/data.ts` (mocks) en cada vista

**Producto**
- [ ] Vista lista/tabla de tareas
- [ ] Vista calendario
- [ ] Export CSV/JSON (botón de clientes existe sin handler; tareas ni eso)
- [ ] Import CSV/JSON
- [ ] Campos financieros en tareas, gastos, pagos, reportes
- [ ] Búsqueda y filtros fuera del Kanban

**UX** (inventario completo en `app-next/BOTONES-SIN-FUNCIONALIDAD.md` — 28 elementos sin handler)
- [ ] Guardar cambios en TaskDetail no persiste; subtareas y comentarios no se pueden crear
- [ ] Menús contextuales `⋯` de columnas y proyectos vacíos
- [ ] Invitar al equipo, Configuración, ítems del menú de usuario sin acción

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

---

## 10. Próximas 5 tareas de implementación

1. **Conectar el login a Supabase Auth** (`app/login/page.tsx`): reemplazar el mock del submit, manejar errores reales, logout real en el menú de usuario, middleware de redirect sin sesión. *(v0.1, bloqueante)*
2. **Restringir acceso al dominio Zoho de Zivelo:** deshabilitar signup público; flujo de invitación desde el botón "Invitar al equipo" del sidebar con validación de dominio. *(v0.1)*
3. **Auditar vista por vista qué lee mocks** (`lib/data.ts`) vs Supabase, y cablear las que falten — empezando por Kanban (TaskDetail "Guardar cambios", subtareas, comentarios: ítems #17–19 de `BOTONES-SIN-FUNCIONALIDAD.md`). *(v0.1)*
4. **Probar RLS con usuarios reales de cada rol:** crear un usuario `editor` y un `viewer` de prueba y verificar que Clientes/MRR quedan inaccesibles por API, no solo ocultos en UI. *(v0.1)*
5. **Verificar el deploy de Vercel** (root directory `app-next`, env vars de Supabase) y dejar URL interna estable documentada en el README. *(v0.1)*
