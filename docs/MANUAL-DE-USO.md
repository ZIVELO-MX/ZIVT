# Zivelo Panel de Control — Manual de Uso

**Versión:** 0.1.0  
**Última actualización:** Mayo 2026  
**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 6  

---

## Índice

1. [Introducción](#1-introducción)
2. [Arquitectura de la aplicación](#2-arquitectura-de-la-aplicación)
3. [Guía de uso](#3-guía-de-uso)
4. [Modelo de datos](#4-modelo-de-datos)
5. [Estándares y normativas aplicadas](#5-estándares-y-normativas-aplicadas)
6. [Accesibilidad (WCAG)](#6-accesibilidad-wcag)
7. [Seguridad (OWASP)](#7-seguridad-owasp)
8. [Rendimiento (Core Web Vitals)](#8-rendimiento-core-web-vitals)
9. [Privacidad y protección de datos](#9-privacidad-y-protección-de-datos)
10. [Compatibilidad cruzada](#10-compatibilidad-cruzada)
11. [Internacionalización](#11-internacionalización)
12. [Despliegue y entorno](#12-despliegue-y-entorno)
13. [Mantenimiento y gobernanza](#13-mantenimiento-y-gobernanza)
14. [Plan de evolución](#14-plan-de-evolución)

---

## 1. Introducción

### 1.1 Propósito

Panel interno de control para el equipo de Zivelo. Gestiona proyectos, tareas (kanban), clientes, usuarios y materiales de aprendizaje en un solo lugar.

### 1.2 Público objetivo

- **Usuarios finales:** Equipo interno de Zivelo (administradores, editores, lectores)
- **Perfil técnico:** Conocimiento básico de navegación web. No requiere capacitación técnica.
- **Idioma:** Español (México) — `es-MX`

### 1.3 Principios de diseño

| Principio | Descripción |
|---|---|
| **Mobile-first** | Diseño responsive progresivo con breakpoints semánticos |
| **Accesibilidad** | Cumplimiento WCAG 2.2 nivel AA como objetivo |
| **Rendimiento** | Carga rápida con Next.js, Core Web Vitals como métrica guía |
| **Seguridad** | Defensa en profundidad, OWASP Top 10 como referencia |
| **Privacidad** | Minimización de datos personales, cumplimiento LFPDPPP |
| **Simplicidad** | Zero runtime dependencies externas; todo el UI es artesanal |

---

## 2. Arquitectura de la aplicación

### 2.1 Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, SSR/CSR, Turbopack |
| UI | React | 19.2.6 | Componentes, hooks, estado |
| Estilos | Tailwind CSS | 4.3.0 | Utilidades CSS, design tokens |
| Lenguaje | TypeScript | 6.0.3 | Tipado estático |
| Bundler | Turbopack | (incluido en Next.js 16) | Compilación y HMR |
| Transpilador CSS | PostCSS + @tailwindcss/postcss | 4.3.0 | Procesamiento de estilos |

### 2.2 Estructura de directorios

```
/
├── app/
│   │   ├── globals.css        # Design tokens, dark mode, animaciones
│   │   ├── layout.tsx         # Root layout (HTML, fonts, metadata)
│   │   ├── page.tsx           # SPA principal (dashboard + vistas)
│   │   └── login/
│   │       └── page.tsx       # Página de inicio de sesión
│   ├── components/
│   │   ├── ui.tsx             # Átomos: Button, Card, Modal, Drawer...
│   │   ├── icons.tsx          # 24 iconos SVG inline
│   │   ├── controls.tsx       # CustomSelect, CustomDatePicker
│   │   ├── sidebar.tsx        # Sidebar + Topbar
│   │   ├── dashboard.tsx      # Dashboard con charts
│   │   ├── kanban.tsx         # Tablero kanban con drag & drop
│   │   ├── projects.tsx       # Gestión de proyectos
│   │   ├── clients.tsx        # CRM de clientes
│   │   ├── users.tsx          # Gestión de usuarios y equipos
│   │   ├── modals.tsx         # Modales: UserMenu, CommandPalette, etc.
│   │   ├── settings.tsx       # Configuración de la aplicación
│   │   ├── profile.tsx        # Perfil de usuario con logros
│   │   └── learning.tsx       # Tablero de aprendizaje
│   └── lib/
│       ├── data.ts            # Tipos, datos mock, utilerías
│       └── utils.ts           # Funciones auxiliares
└── docs/
    └── MANUAL-DE-USO.md       # Este documento
```

### 2.3 Patrón de estado

Estado centralizado en `page.tsx` con flujo unidireccional:

```
page.tsx (dueño del estado)
  ├── Sidebar ← (view, counts, callbacks)
  ├── Topbar ← (view, callbacks)
  ├── Dashboard ← (projects, tasks, clients)
  ├── Kanban ← (tasks, setTasks, projects)
  ├── Projects ← (projects, setProjects, ...)
  ├── Clients ← (clients, setClients, ...)
  ├── Users ← (tasks, projects, ...)
  ├── Learning ← (tasks, setTasks)
  ├── Settings ← (dark, density, ...)
  └── Profile ← (tasks, projects)
```

- **Sin librerías externas de estado** — solo `useState` + `useEffect`
- **Persistencia en `localStorage`:** tema oscuro, colapso del sidebar, densidad de interfaz, email recordado
- **Sin API backend** — fase actual opera con datos mock en memoria

### 2.4 Sistema de diseño (Design Tokens)

Definido en `globals.css` usando `@theme` de Tailwind v4:

| Token | Valor | Uso |
|---|---|---|
| `--color-zred` | `#D72228` | Color primario (rojo de marca) |
| `--color-carbon` | `#1D1D1B` | Color de texto principal |
| `--color-soft` | `#F5F5F5` | Fondos secundarios |
| `--color-muted` | `#6B6B6B` | Texto secundario |
| `--color-line` | `rgba(29,29,27,0.10)` | Bordes |
| `--font-sans` | `Inter, system-ui, sans-serif` | Tipografía principal |
| `--radius-md` | `16px` | Radio de borde estándar |
| `--shadow-pop` | `0 24px 60px rgba(29,29,27,0.18)` | Sombras de elevación |

---

## 3. Guía de uso

### 3.1 Inicio de sesión

1. Navegar a `/login`
2. Ingresar email corporativo `@zivelo.dev`
3. Ingresar contraseña
4. Opcional: marcar "Recordarme en este dispositivo"
5. Presionar "Iniciar sesión"

**Nota:** Actualmente el login es simulado (delay de 700ms). La integración con Supabase Auth está planificada como siguiente fase.

### 3.2 Navegación principal

| Elemento | Acción |
|---|---|
| Sidebar (izquierda) | Cambiar entre vistas: Dashboard, Pendientes, Aprendizaje, Proyectos, Clientes, Usuarios |
| Botón colapsar sidebar | Reduce a 72px (solo iconos). Botón flotante para expandir |
| Topbar (superior) | Muestra ubicación actual + búsqueda ⌘K |
| Avatar de usuario | Menú desplegable: perfil, preferencias, atajos, cerrar sesión |
| ⌘K | Abrir paleta de comandos |

### 3.3 Dashboard

- **Tarjetas de métricas:** Proyectos activos, tareas en curso, clientes activos, MRR estimado
- **Gráfico de tareas completadas:** Barras con filtros 6M / YTD / 12M
- **Donut de estados:** Distribución de proyectos por estado
- **Próximas entregas:** Tareas ordenadas por vencimiento
- **Carga del equipo:** Barra de progreso por miembro

### 3.4 Kanban (Pendientes)

**5 columnas:** Backlog → To Do → In Progress → Review → Done

- Arrastrar tarjetas entre columnas (drag & drop)
- Click en tarjeta → abre detalle con edición completa
- Botón **+** en columna → crear nueva tarea
- Menú contextual (⋯) en columna → renombrar, limpiar, archivar

**Detalle de tarea (Drawer):**
- Editar título, estado, prioridad, vencimiento, asignados
- Progreso por persona (Pendiente / En curso / Completado)
- Subtareas con check (agregar inline)
- Descripción (textarea)
- Comentarios con timestamp y avatar

### 3.5 Proyectos

Vistas: **Grid** (tarjetas) / **Tabla**

- Filtrar por estado: Todos / En progreso / En revisión / Por iniciar / Terminados
- Buscar por nombre
- Menú contextual (⋯) en tarjeta: Ver detalle, Duplicar, Eliminar
- Detalle en Drawer: Resumen, Archivos (drag & drop upload), Notas

### 3.6 Clientes

Tabla con: Cliente, Contacto, Estado, Proyectos, MRR, Antigüedad

- Filtrar: Todos / Activos / Prospectos / Pausados
- Buscar por nombre, contacto o email
- Exportar a CSV
- Click en fila → detalle del cliente con proyectos asociados

### 3.7 Usuarios

Pestañas: **Miembros** / **Equipos de trabajo**

- Filtrar por estado
- Buscar por nombre, email o rol
- Invitar nuevo miembro (modal con selección de rol y color)
- Editar, suspender, eliminar

### 3.8 Aprendizaje

Tablero kanban de 3 columnas: Por estudiar → En curso → Completado

- Recursos: video, curso, artículo, libro, podcast
- Drag & drop entre columnas
- Editar detalle con URL, duración, etiquetas

### 3.9 Atajos de teclado

| Atajo | Acción |
|---|---|
| `⌘K` | Abrir/cerrar paleta de comandos |
| `⌘/` o `?` | Abrir/cerrar modal de atajos |
| `Esc` | Cerrar modal, drawer, dropdown |
| `↑↓` + `Enter` | Navegar resultados (paleta de comandos, selects) |

---

## 4. Modelo de datos

### 4.1 Entidades principales

```
Usuario (User)
├── id: string
├── name, initials, color
├── email, phone, role
├── status: active | invited | suspended
├── permission: admin | editor | viewer
└── joined, lastActive

Cliente (Client)
├── id: string
├── name, industry, contact
├── email, phone, city
├── status: active | lead | paused
├── projects: number
└── mrr: number

Proyecto (Project)
├── id, name, client, kind
├── status: todo | in_progress | review | done
├── progress, start, due, team[]
├── health: on_track | at_risk
├── budget, spent
├── tasksDone, tasksTotal
└── accent

Tarea (Task)
├── id, col, project, title
├── tag, priority: low | med | high
├── due, assignee[], subtasks[]
├── comments, progress: Record<userId, status>
└── (comentarios gestionados aparte)
```

### 4.2 Relaciones

- **Proyecto → Cliente:** Uno a uno (opcional, un proyecto puede ser interno)
- **Tarea → Proyecto:** Muchos a uno
- **Tarea → Usuario:** Muchos a muchos (assignees)
- **Usuario → Equipo:** Muchos a muchos

### 4.3 Lookup tables

| Tabla | Propósito |
|---|---|
| `PERMISSIONS` | admin/editor/viewer — etiquetas, descripciones, estilos |
| `USER_STATUS` | active/invited/suspended — estilos visuales |
| `TAG_STYLES` | Etiquetas de tareas (feature, bug, design, etc.) |
| `PRIORITY` | low/med/high — colores de punto |
| `STATUS_LABEL` | Estados de proyectos y clientes |
| `COLUMNS` | 5 columnas del kanban |
| `LEARNING_COLS` | 3 columnas del tablero de aprendizaje |

---

## 5. Estándares y normativas aplicadas

### 5.1 Estándares W3C / WHATWG

| Estándar | Estado de cumplimiento | Observaciones |
|---|---|---|
| **HTML Living Standard** | ✅ Parcial | Etiquetas semánticas (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`) |
| **HTML5 semantic elements** | ✅ Parcial | Tablas con `<thead>`/`<tbody>`, formularios con etiquetas |
| **CSS Grid Layout** | ✅ Completo | Layout responsive con `grid-cols-*`, `grid-template-columns` |
| **CSS Custom Properties** | ✅ Completo | Design tokens en `@theme`, variables CSS nativas |
| **CSS Animations** | ✅ Completo | `@keyframes`, transiciones CSS |
| **ECMAScript 2022+** | ⚠️ Parcial | Target ES2022 en tsconfig, sin polyfills para navegadores antiguos |
| **Web Content Accessibility Guidelines (WCAG) 2.2** | ⚠️ Parcial | Ver sección 6 |
| **Web App Manifest** | ❌ Ausente | Sin manifiesto PWA (`manifest.json`) |
| **Service Workers** | ❌ Ausente | Sin registro de service worker |

### 5.2 Cumplimiento normativo por región

| Regulación | Aplica | Estado |
|---|---|---|
| **LFPDPPP** (México — Ley Federal de Protección de Datos Personales) | Sí | ⚠️ Parcial — sin backend aún |
| **GDPR** (Europa — General Data Protection Regulation) | No aplica (solo México) | N/A |
| **CCPA** (California) | No aplica | N/A |
| **COPPA** (menores de 13) | No aplica (solo uso corporativo) | N/A |

---

## 6. Accesibilidad (WCAG 2.2)

### 6.1 Nivel de cumplimiento objetivo: AA

| Principio | Pauta | Estado | Detalle |
|---|---|---|---|
| **1. Perceptible** | 1.1.1 Contenido no textual | ⚠️ Parcial | Iconos SVG sin `aria-hidden`; logo sin `alt` descriptivo |
| | 1.4.3 Contraste mínimo (AA) | ✅ Cumple | Ratio ≥ 4.5:1 en todos los textos |
| | 1.4.4 Cambio de tamaño texto | ✅ Cumple | Unidades relativas, zoom no rompe layout |
| **2. Operable** | 2.1.1 Teclado | ⚠️ Parcial | Sin focus trap en modales; kanban no operable con teclado |
| | 2.4.3 Orden del foco | ⚠️ Parcial | Sin orden de tabulación explícito |
| | 2.4.7 Foco visible | ✅ Cumple | `:focus-visible` con anillo rojo de 4px |
| **3. Comprensible** | 3.2.3 Navegación consistente | ✅ Cumple | Sidebar y topbar consistentes en todas las vistas |
| | 3.3.2 Etiquetas e instrucciones | ✅ Cumple | Todos los inputs tienen `<label>` |
| **4. Robusto** | 4.1.2 Nombre, rol, valor | ⚠️ Parcial | Drawers sin `role="dialog"`, botones sin `aria-expanded` |

### 6.2 Auditoría de componentes

| Componente | Problema | Recomendación WCAG |
|---|---|---|
| `IconButton` | Sin `aria-label` | Agregar `aria-label` descriptivo en cada instancia |
| `Drawer` | Sin `role="dialog"` ni `aria-modal` | Agregar `role="dialog" aria-modal="true"` |
| `Modal` | Sin `aria-labelledby` | Vincular título con `aria-labelledby` |
| `TaskCard` | `div` draggable sin `tabIndex` | Agregar `tabIndex={0}` y `role="button"` |
| Kanban | Drag & drop solo mouse | Implementar alternativa con teclado o menú contextual |
| `CustomSelect` | Dropdown portaleado sin manejo de `aria-activedescendant` | Vincular opción activa con ARIA |
| Sidebar | NavItems sin `aria-current="page"` en elemento activo | Agregar `aria-current="page"` |
| Color solo | Indicadores de estado (punto verde "En línea") | Agregar texto oculto o `aria-label` |
| Foco | Modales sin focus trap | Implementar focus trapping con `useFocusTrap` |

### 6.3 Recomendaciones prioritarias

1. **Alta:** Agregar `focus-trap` en todos los modales y drawers
2. **Alta:** Agregar `aria-label` en todos los `IconButton` y SVG decorativos
3. **Alta:** Hacer el kanban operable con teclado (alternativa al drag)
4. **Media:** Agregar roles ARIA (`dialog`, `modal`, `tabpanel`)
5. **Media:** Implementar `aria-current` en navegación activa
6. **Baja:** Agregar texto oculto para indicadores de solo-color

---

## 7. Seguridad (OWASP)

### 7.1 OWASP Top 10 — Evaluación

| Riesgo | Estado | Mitigación |
|---|---|---|
| **A01: Broken Access Control** | ⚠️ Parcial | Sin autenticación real aún. La ruta `/` es accesible sin login |
| **A02: Cryptographic Failures** | ✅ No aplica | Sin datos sensibles en tránsito (sin backend) |
| **A03: Injection** | ⚠️ Parcial | URLs de usuario en `href` sin sanitizar (`modals.tsx`) |
| **A04: Insecure Design** | ⚠️ Parcial | Sin rate limiting, sin validación server-side |
| **A05: Security Misconfiguration** | ⚠️ Parcial | Sin CSP headers, Sin Helmet |
| **A06: Vulnerable Components** | ✅ Cumple | Dependencias mínimas (3 runtime) y actualizadas |
| **A07: Identification & Auth Failures** | ❌ Crítico | Login simulado, sin sesiones reales, sin MFA |
| **A08: Data Integrity Failures** | ✅ No aplica | Sin CI/CD pipeline ni actualizaciones automáticas |
| **A09: Security Logging & Monitoring** | ❌ Ausente | Sin logging de actividad |
| **A10: SSRF** | ✅ No aplica | Sin solicitudes server-side |

### 7.2 Medidas implementadas

| Medida | Implementación |
|---|---|
| Validación de email | Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` en formulario de invitación |
| Restricción de dominio | Solo emails `@zivelo.dev` permitidos en login |
| Contraseña mínima | Validación >= 4 caracteres |
| Sanitización de entrada | Titles y descripciones renderizados como texto JSX (no dangerouslySetInnerHTML) |
| Sin innerHTML | Cero usos de `dangerouslySetInnerHTML` en el código base |

### 7.3 Riesgos identificados

| # | Riesgo | Archivo | Gravedad | Acción requerida |
|---|---|---|---|---|
| 1 | URLs de usuario sin validar en `href` | `modals.tsx:839` | Media | Validar/sanitizar URL antes de usarla en enlace |
| 2 | Login completamente simulado | `app/login/page.tsx:51` | Alta | Integrar con Supabase Auth |
| 3 | Sin CSP | Configuración de Next.js | Media | Agregar Content-Security-Policy |
| 4 | Sin protección de rutas | `app/page.tsx` | Alta | Implementar middleware de autenticación |
| 5 | Datos mock con PII realista | `lib/data.ts` | Baja | Reemplazar con datos sintéticos en producción |

### 7.4 Checklist de seguridad pre-producción

- [ ] Implementar autenticación real (Supabase Auth o similar)
- [ ] Agregar middleware de protección de rutas (`middleware.ts`)
- [ ] Configurar Content-Security-Policy headers
- [ ] Sanitizar URLs ingresadas por usuarios
- [ ] Implementar rate limiting en formularios
- [ ] Agregar HTTP-only cookies para sesiones
- [ ] Configurar headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- [ ] Reemplazar datos mock con datos sintéticos
- [ ] Implementar logging de accesos y actividad

---

## 8. Rendimiento (Core Web Vitals)

### 8.1 Métricas objetivo

| Métrica | Objetivo | Estado actual estimado |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ Bueno — app liviana, sin imágenes pesadas |
| **FID/INP** (Interaction to Next Paint) | < 200ms | ⚠️ Regular — sin `React.memo`, renders innecesarios |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ Bueno — layout estable sin cambios after paint |
| **TBT** (Total Blocking Time) | < 200ms | ⚠️ Regular — bundle grande sin code-splitting interno |
| **FCP** (First Contentful Paint) | < 1.8s | ✅ Bueno — Next.js SSR/CSR |

### 8.2 Buenas prácticas implementadas

| Práctica | Estado | Ubicación |
|---|---|---|
| `useMemo` en filtros y búsquedas | ✅ Implementado | kanban.tsx, modals.tsx, profile.tsx |
| `useRef` para evitar re-renders | ✅ Implementado | Múltiples componentes |
| Animaciones CSS (no JS) | ✅ Implementado | `@keyframes`, transiciones CSS |
| Sin imágenes pesadas | ✅ Implementado | Solo SVGs (logo), avatares son CSS |
| SVGs inline sin HTTP requests | ✅ Implementado | icons.tsx |
| `reactStrictMode` | ✅ Implementado | next.config.mjs |

### 8.3 Oportunidades de mejora

| Área | Impacto | Acción |
|---|---|---|
| `React.memo` en listas (tarjetas kanban, filas de tabla) | Medio | Evitar renders de items no modificados |
| Dynamic imports (`next/dynamic`) para modales | Alto | Cargar modales y drawers bajo demanda |
| Virtualización en tablas (tanstack/react-virtual) | Medio | Para listas > 50 registros |
| `next/image` para imágenes | Bajo | Actualmente solo SVGs, preparar para assets futuros |
| Code splitting por vista | Alto | Separar bundle de dashboard/kanban/proyectos |
| Eliminar `'use client'` innecesarios | Bajo | Convertir a Server Components donde no se requiera interactividad |

### 8.4 Budget de rendimiento

```
┌───────────────────────────────────────┬────────────┐
│ Recurso                               │  Límite    │
├───────────────────────────────────────┼────────────┤
│ JavaScript total (gzip)               │ < 150 KB  │
│ CSS total (gzip)                      │ < 20 KB   │
│ Tiempo para interactivo (TTI)         │ < 3.5s    │
│ Peticiones HTTP en carga inicial      │ < 10      │
│ Tamaño de fuente (Google Fonts)       │ < 30 KB   │
└───────────────────────────────────────┴────────────┘
```

---

## 9. Privacidad y protección de datos

### 9.1 Datos personales recolectados

| Dato | Propósito | Almacenamiento | Retención |
|---|---|---|---|
| Nombre completo | Identificación en el sistema | En memoria (mock) | Indefinido (fase mock) |
| Email corporativo | Autenticación y contacto | localStorage ("Recordarme") | Hasta cierre de sesión |
| Teléfono | Contacto directo | En memoria (mock) | Indefinido (fase mock) |
| Preferencias de UI | Experiencia de usuario | localStorage | Hasta que el usuario las cambie |
| Tema (oscuro/claro) | Preferencia visual | localStorage | Persistente |

### 9.2 Principios LFPDPPP

| Principio | Estado | Implementación |
|---|---|---|
| **Licitud** | ✅ | Datos usados solo para la operación del panel |
| **Consentimiento** | ⚠️ | Sin aviso de privacía visible |
| **Calidad** | ⚠️ | Datos mock, sin validación de calidad |
| **Finalidad** | ✅ | Propósitos claros y explícitos |
| **Proporcionalidad** | ✅ | Solo datos necesarios para la operación |
| **Información** | ❌ | Sin aviso de privacidad implementado |
| **Responsabilidad** | ⚠️ | Sin medidas documentadas de protección |

### 9.3 Recomendaciones para cumplimiento LFPDPPP

1. **Agregar Aviso de Privacidad** en `/privacy` con:
   - Identidad y domicilio del responsable
   - Finalidades del tratamiento
   - Opciones para limitar uso de datos
   - Procedimiento ARCO (Acceso, Rectificación, Cancelación, Oposición)
   - Transferencias de datos
2. **Implementar consentimiento explícito** en el registro
3. **Política de retención** de datos personales
4. **Bitácora de accesos** a datos personales

---

## 10. Compatibilidad cruzada

### 10.1 Navegadores soportados

| Navegador | Estado | Observaciones |
|---|---|---|
| Google Chrome ≥ 90 | ✅ Completo | Ventana objetivo principal |
| Mozilla Firefox ≥ 90 | ⚠️ Parcial | Scrollbar no personalizado (`::-webkit-scrollbar`) |
| Apple Safari ≥ 15 | ⚠️ Parcial | `100vh` en mobile Safari requiere `dvh` |
| Microsoft Edge ≥ 90 | ✅ Completo | Chromium-based |
| Opera ≥ 76 | ✅ Completo | Chromium-based |
| Safari iOS ≥ 15 | ❌ Parcial | Drag & drop no funciona en touch |
| Chrome Android ≥ 90 | ❌ Parcial | Drag & drop no funciona en touch |
| Samsung Internet ≥ 15 | ⚠️ Parcial | Mismas limitaciones que Chrome Android |

### 10.2 Dispositivos móviles

| Aspecto | Estado | Problema |
|---|---|---|
| Viewport meta tag | ❌ Ausente | Sin `<meta name="viewport">`, móviles renderizan a 980px |
| Sidebar responsive | ❌ No implementado | Sidebar fijo de 252px ocupa 60% en mobile |
| Kanban touch | ❌ No soportado | HTML5 DnD no funciona en dispositivos táctiles |
| Tablas responsive | ❌ No implementado | Tablas sin scroll horizontal en mobile |
| Menú hamburguesa | ❌ No implementado | Sin drawer de navegación para mobile |
| Touch targets | ⚠️ Parcial | Botones ≥ 44px (parcialmente), algunos iconos pequeños |
| Font scaling | ✅ Correcto | Unidades rem/em, texto escalable |

### 10.3 Pruebas de compatibilidad pendientes

- [ ] Chrome Desktop (macOS, Windows, Linux)
- [ ] Firefox Desktop (macOS, Windows, Linux)
- [ ] Safari Desktop (macOS)
- [ ] Safari iOS (iPhone, iPad)
- [ ] Chrome Android (teléfono, tablet)
- [ ] Samsung Internet
- [ ] Edge Desktop (Windows)
- [ ] Modo oscuro en todos los navegadores
- [ ] Zoom 200% en todos los navegadores
- [ ] Lectores de pantalla (VoiceOver, NVDA, JAWS)

---

## 11. Internacionalización

### 11.1 Configuración actual

| Aspecto | Configuración |
|---|---|
| Idioma | Español (México) — `es-MX` |
| Moneda | MXN (Peso Mexicano) — `Intl.NumberFormat('es-MX')` |
| Fechas | `Intl.DateTimeFormat('es-MX', { ... })` |
| Zona horaria | UTC-6 (Centro de México) — por defecto del navegador |
| HTML lang | `lang="es"` en `<html>` |

### 11.2 Formato de datos

| Tipo | Formato | Ejemplo |
|---|---|---|
| Fecha larga | `es-MX` | "lunes, 18 de mayo de 2026" |
| Fecha corta | `es-MX` | "18 may 2026" |
| Moneda | `es-MX` | $15,000.00 MXN |
| Números | `es-MX` | 1,234.56 |

### 11.3 Preparación para más idiomas

El sistema actual **no usa i18n library**. Para agregar soporte multi-idioma:

1. Integrar `next-intl` o similar
2. Extraer strings a archivos de traducción (`/messages/es.json`, `/messages/en.json`)
3. Implementar selector de idioma en Settings
4. Usar `Intl.DateTimeFormat` con locale dinámico

---

## 12. Despliegue y entorno

### 12.1 Configuración del entorno

```bash
# Variables de entorno requeridas (futuro)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### 12.2 Comandos

| Comando | Propósito |
|---|---|
| `npm run dev` | Desarrollo con Turbopack HMR |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |
| `npm run lint` | Linting con Next.js ESLint |

### 12.3 Build

```bash
next build  # Genera .next/ con output estático + server
```

- **Target:** ES2022 (TypeScript compila a módulos ES modernos)
- **CSS:** PostCSS + Tailwind v4 (purge automático de clases no usadas)
- **JS:** Turbopack bundling con tree-shaking
- **Optimización:** Sin `next/image` configurado, sin `next/dynamic`

### 12.4 Checklist pre-despliegue

- [ ] Variables de entorno configuradas
- [ ] `next build` exitoso sin errores
- [ ] Linting aprobado (`npm run lint`)
- [ ] Datos mock reemplazados con backend real
- [ ] Autenticación funcional
- [ ] CSP headers configurados
- [ ] Aviso de privacidad publicado
- [ ] Pruebas de accesibilidad ejecutadas
- [ ] Pruebas cross-browser ejecutadas
- [ ] Pruebas en mobile ejecutadas

---

## 13. Mantenimiento y gobernanza

### 13.1 Dependencias

| Paquete | Versión actual | Critical | Ciclo de actualización |
|---|---|---|---|
| `next` | 16.2.6 | Alta | Mensual (seguir releases canary) |
| `react` / `react-dom` | 19.2.6 | Alta | Con Next.js |
| `tailwindcss` | 4.3.0 | Media | Trimestral |
| `typescript` | 6.0.3 | Media | Semestral |

### 13.2 Deuda técnica identificada

| # | Ítem | Impacto | Esfuerzo estimado |
|---|---|---|---|
| 1 | `strict: false` en tsconfig | Tipado inseguro puede ocultar bugs | 2-3 días |
| 2 | Sin Server Components | Todo es `'use client'`, bundle grande | 1-2 días |
| 3 | Sin focus trap en modales | UX de teclado incompleta | 4-6 horas |
| 4 | Sin viewport meta tag | Mobile broken | 5 minutos |
| 5 | Drag & drop solo desktop | Kanban no funciona en mobile | 1-2 días |
| 6 | Sidebar no responsive | Navegación mobile limitada | 1 día |
| 7 | Sin testing | Sin cobertura de pruebas | 3-5 días (setup inicial) |

### 13.3 Gobernanza de código

| Práctica | Estado |
|---|---|
| Conventional Commits | ❌ No implementado |
| Code Review | ❌ Sin proceso definido |
| Branch Strategy | ❌ Sin definir |
| CI/CD | ❌ Sin pipeline |
| Testing | ❌ Sin framework de pruebas |
| Linting | ✅ next lint (ESLint integrado) |
| TypeScript strict mode | ❌ `strict: false` |

---

## 14. Plan de evolución

### 14.1 Fase inmediata: Supabase Integration

| Task | Prioridad |
|---|---|
| Supabase Auth (login real, SSO, sesiones, RLS) | 🔴 Crítica |
| Migrar mock data a tablas reales | 🔴 Crítica |
| Endpoints REST para CRUD | 🟡 Alta |
| Deploy a Vercel | 🟡 Alta |

### 14.2 Fase 2: Accesibilidad y mobile

| Task | Prioridad | Estándar |
|---|---|---|
| Viewport meta tag + responsive sidebar | 🔴 Crítica | W3C / Mobile-first |
| Touch support en kanban | 🟡 Alta | W3C Pointer Events |
| Focus trap + ARIA roles | 🟡 Alta | WCAG 2.2 |
| Tablas responsive con scroll | 🟡 Alta | Responsive design |
| Pruebas con lectores de pantalla | 🟢 Media | WCAG 2.2 |

### 14.3 Fase 3: Seguridad y privacidad

| Task | Prioridad | Estándar |
|---|---|---|
| CSP headers | 🟡 Alta | OWASP |
| Aviso de privacidad | 🟡 Alta | LFPDPPP |
| Sanitización de URLs | 🟡 Alta | OWASP |
| Rate limiting | 🟢 Media | OWASP |
| Bitácora de accesos | 🟢 Media | LFPDPPP |

### 14.4 Fase 4: Rendimiento y PWA

| Task | Prioridad | Estándar |
|---|---|---|
| Dynamic imports para modales | 🟡 Alta | Core Web Vitals |
| Virtualización de tablas | 🟢 Media | Performance |
| Manifest.json + Service Worker | 🟢 Media | PWA |
| Lighthouse score > 90 | 🟢 Media | Core Web Vitals |

---

## Apéndice A: Glosario

| Término | Definición |
|---|---|
| **MRR** | Monthly Recurring Revenue — Ingreso recurrente mensual |
| **RLS** | Row Level Security — Políticas de seguridad a nivel de fila en Supabase |
| **CSP** | Content Security Policy — Cabecera HTTP de seguridad |
| **LFPDPPP** | Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México) |
| **WCAG** | Web Content Accessibility Guidelines — Pautas de accesibilidad web |
| **CLS** | Cumulative Layout Shift — Métrica de estabilidad visual de Core Web Vitals |
| **LCP** | Largest Contentful Paint — Métrica de velocidad de carga de Core Web Vitals |
| **INP** | Interaction to Next Paint — Métrica de interactividad de Core Web Vitals |
| **SSR/CSR** | Server-Side Rendering / Client-Side Rendering |
| **HMR** | Hot Module Replacement — Recarga en caliente de módulos en desarrollo |

## Apéndice B: Referencias normativas

| Normativa / Estándar | Versión | URL |
|---|---|---|
| WCAG 2.2 | 2.2 | https://www.w3.org/TR/WCAG22/ |
| HTML Living Standard | — | https://html.spec.whatwg.org/ |
| OWASP Top 10 | 2021 | https://owasp.org/www-project-top-ten/ |
| LFPDPPP (México) | 2017 | https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf |
| Core Web Vitals | 2024 | https://web.dev/vitals/ |
| PWA Checklist | — | https://web.dev/pwa-checklist/ |
| ARIA Authoring Practices | 1.2 | https://www.w3.org/WAI/ARIA/apg/ |
| Content Security Policy | — | https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP |

---

*Documento generado como parte del análisis de cumplimiento normativo de Zivelo Panel de Control v0.1.0*
