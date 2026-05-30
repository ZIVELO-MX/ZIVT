# Botones sin funcionalidad

Análisis de todos los botones, enlaces y elementos clickeables que actualmente no hacen nada o tienen implementación placeholder.

---

## Login (`app/login/page.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 1 | 107 | `¿Olvidaste tu contraseña?` | Navegar a `/auth/forgot-password` — actualmente `href="#"` |
| 2 | 183–186 | Botón **Google SSO** | Iniciar OAuth con Google (redirect a Supabase/NextAuth) — sin `onClick` |
| 3 | 187–190 | Botón **GitHub SSO** | Iniciar OAuth con GitHub — sin `onClick` |
| 4 | 195 | `Solicita una invitación a un administrador` | Copiar email del admin o abrir modal de contacto — es un `<span>` no interactivo |
| 5 | 203 | **Soporte** (footer) | Navegar a `/support` — `href="#"` |
| 6 | 204 | **Privacidad** (footer) | Navegar a `/privacy` — `href="#"` |
| 7 | 205 | **Estado del sistema** (footer) | Navegar a `status.zivelo.dev` o `/status` — `href="#"` |
| 8 | 142–150 | **Recordarme** checkbox | Persistir email en localStorage/cookie para que sobreviva al refresh — solo estado en memoria |
| 9 | 27–43 | **Iniciar sesión** submit | Autenticar contra backend real — actualmente mock con 700ms de delay y `router.push('/')` |

---

## Sidebar (`components/sidebar.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 10 | 134 | NavItem **Configuración** | Navegar a vista de configuración o abrir modal de ajustes — sin `onClick` |
| 11 | 136–147 | Botón **Invitar al equipo** (expandido) | Abrir modal de invitación (reutilizar UserFormModal de users.tsx) — sin `onClick` |
| 12 | 149–151 | Botón **Invitar al equipo** (colapsado, icono `+`) | Abrir modal de invitación — sin `onClick` |

---

## Dashboard (`components/dashboard.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 13 | 143 | Botón **6M** (período gráfico) | Filtrar datos del chart a últimos 6 meses — sin `onClick` |
| 14 | 144 | Botón **YTD** (período gráfico) | Filtrar datos del chart al año actual — sin `onClick` |
| 15 | 145 | Botón **12M** (período gráfico) | Filtrar datos del chart a 12 meses — sin `onClick` |

---

## Kanban (`components/kanban.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 16 | 109–111 | Botón `⋯` (encabezado de columna) | Menú contextual de columna (renombrar, archivar, limpiar tareas) — sin `onClick` |
| 17 | 165 | **Guardar cambios** (TaskDetail) | Persistir cambios del formulario — sin `onClick` |
| 18 | 206 | **+ Añadir** subtarea (TaskDetail) | Abrir input para agregar subtarea — sin `onClick` |
| 19 | 251 | Input de comentarios (TaskDetail) | Enviar comentario al presionar Enter — sin `onKeyDown` ni botón de envío |
| 20 | 368 | Botón `+` (miembros del equipo en toolbar) | Abrir selector para añadir miembro al equipo — sin `onClick` |

---

## Proyectos (`components/projects.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 21 | 30–32 | Botón `⋯` (tarjeta de proyecto) | Menú contextual (editar, duplicar, archivar, eliminar) — solo `stopPropagation`, sin acción |

---

## Clientes (`components/clients.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 22 | 291 | Botón **Exportar CSV** | Generar y descargar CSV de clientes filtrados — sin `onClick` |
| 23 | 148 | **+ Nuevo** (en ClientDetailDrawer) | Abrir modal para crear proyecto vinculado al cliente — sin `onClick` |

---

## Menú de usuario (`components/modals.tsx`)

| # | Línea | Elemento | Debería hacer |
|---|-------|----------|---------------|
| 24 | 178 | **Mi perfil** | Navegar a perfil del usuario |
| 25 | 179 | **Preferencias** | Abrir panel de preferencias del sistema |
| 26 | 180 | **Notificaciones** | Abrir configuración de notificaciones |
| 27 | 181 | **Atajos de teclado** | Mostrar overlay con todos los atajos de teclado |
| 28 | 198 | **Cerrar sesión** | Actualmente navega a `/login`. Debería: `POST /api/auth/logout` → invalidar sesión → redirect a `/login` |

---

## Resumen por prioridad

### Alta (bloqueante para MVP)
- **Login submit** (#9) — necesita conectar con Supabase Auth
- **SSO Google/GitHub** (#2, #3) — parte del flujo de auth

### Media (UX incompleta)
- **Settings** (#10), **UserMenu items** (#24-27) — acciones de navegación faltantes
- **Cerrar sesión** (#28) — implementación incorrecta
- **Invitar al equipo** (#11, #12) — acción de equipo faltante
- **Exportar CSV** (#22) — funcionalidad de exportación de datos
- **Periodos de chart** (#13-15) — filtros de dashboard

### Baja (mejoras)
- **Footer links** (#5-7) — solo placeholder
- **Dots menus** (#16, #21) — menús contextuales
- **TaskDetail** (#17-19) — edición y comentarios
- **Recordarme** (#8) — persistencia de sesión
- **+ Nuevo proyecto en cliente** (#23) — atajo contextual

---

*Generado: análisis automático de componentes en `app-next/`*
