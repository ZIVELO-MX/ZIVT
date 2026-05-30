// Mock data + types — reemplazado por Supabase en fases posteriores

export type User = {
  id: string; name: string; initials: string; color: string;
  role: string; email: string; phone: string;
  status: "active" | "invited" | "suspended";
  permission: "admin" | "editor" | "viewer";
  joined: string; lastActive: string;
};

export type Client = {
  id: string; name: string; industry: string; contact: string;
  email: string; phone: string; city: string; since: string;
  status: "active" | "lead" | "paused"; projects: number; mrr: number;
};

export type Project = {
  id: string; name: string; client: string | null; kind: string;
  status: "todo" | "in_progress" | "review" | "done";
  progress: number; start: string; due: string; team: string[];
  health: "on_track" | "at_risk"; budget: number; spent: number;
  tasksDone: number; tasksTotal: number; accent: string;
};

export type MemberProgress = 'todo' | 'progress' | 'done';
export type Subtask = { t: string; d: boolean };
export type Task = {
  id: string; col: string; project: string; title: string;
  tag: string; priority: "low" | "med" | "high";
  due: string | null; assignee: string[]; subtasks: Subtask[]; comments: number;
  progress: Record<string, MemberProgress>;
};

export const TEAM: User[] = [
  { id:"u1", name:"Raúl Méndez",    initials:"RM", color:"#D72228", role:"Founder",  email:"raul@zivelo.dev",   phone:"—", status:"active",    permission:"admin",  joined:"2026-01-06", lastActive:"En línea" },
  { id:"u2", name:"María López",    initials:"ML", color:"#1D1D1B", role:"Frontend", email:"maria@zivelo.dev",  phone:"—", status:"active",    permission:"editor", joined:"2026-01-18", lastActive:"hace 12 min" },
  { id:"u3", name:"Carlos Pérez",   initials:"CP", color:"#6B6B6B", role:"Backend",  email:"carlos@zivelo.dev", phone:"—", status:"active",    permission:"editor", joined:"2026-02-03", lastActive:"hace 1 h" },
  { id:"u4", name:"Ana Ruiz",       initials:"AR", color:"#B91C22", role:"Diseño",   email:"ana@zivelo.dev",    phone:"—", status:"active",    permission:"editor", joined:"2026-02-20", lastActive:"hace 3 h" },
  { id:"u5", name:"Luis Hernández", initials:"LH", color:"#2F4858", role:"QA",       email:"luis@zivelo.dev",   phone:"—", status:"active",    permission:"viewer", joined:"2026-03-08", lastActive:"ayer" },
  { id:"u6", name:"Sofía Torres",   initials:"ST", color:"#7A5A12", role:"Marketing",email:"sofia@zivelo.dev",  phone:"—", status:"invited",   permission:"viewer", joined:"2026-05-10", lastActive:"—" },
  { id:"u7", name:"Jorge Beltrán",  initials:"JB", color:"#3A47B5", role:"Developer",email:"jorge@zivelo.dev",  phone:"+52 392 110 5500", status:"suspended", permission:"editor", joined:"2026-04-22", lastActive:"hace 14 d" },
];

export const PERMISSIONS = {
  admin:  { label:"Admin",   desc:"Control total del workspace, billing y miembros", cls:"bg-tint text-zred" },
  editor: { label:"Editor",  desc:"Crear y editar proyectos, tareas y clientes",     cls:"bg-[#EEF2FF] text-[#3A47B5]" },
  viewer: { label:"Lectura", desc:"Solo puede ver el contenido del workspace",       cls:"bg-soft text-carbon" },
} as const;

export const USER_STATUS = {
  active:    { label:"Activo",             cls:"bg-[#E6F4EA] text-[#1E6B3C]" },
  invited:   { label:"Invitación enviada", cls:"bg-[#FFF4DE] text-[#7A5A12]" },
  suspended: { label:"Suspendido",         cls:"bg-tint text-zred" },
} as const;

export const CLIENTS_INIT: Client[] = [
  { id:"c1", name:"Pasta della Nonna", industry:"Restaurante",  contact:"Lucía Romano",   email:"lucia@pastanonna.mx",     phone:"+52 392 110 7401", city:"León, GTO",   since:"2026-01-14", status:"active", projects:2, mrr:18000 },
  { id:"c2", name:"Café Bruma",        industry:"Restaurante",  contact:"Marcos Téllez",  email:"marcos@cafebruma.com",    phone:"+52 477 220 8812", city:"Guadalajara", since:"2026-02-02", status:"active", projects:1, mrr:9500  },
  { id:"c3", name:"Andamio MX",        industry:"Construcción", contact:"Ricardo Salas",  email:"r.salas@andamio.mx",      phone:"+52 55 5421 3309", city:"CDMX",        since:"2026-01-20", status:"active", projects:1, mrr:22000 },
  { id:"c4", name:"Boutique Etérea",   industry:"Retail",       contact:"Sandra Rivas",   email:"hola@boutique-eterea.com",phone:"+52 33 1188 4471", city:"Zapopan",     since:"2026-04-11", status:"lead",   projects:0, mrr:0     },
  { id:"c5", name:"Clínica Dental Vera",industry:"Salud",       contact:"Dr. Iván Vera",  email:"contacto@clinicavera.mx", phone:"+52 392 110 0021", city:"León, GTO",   since:"2026-03-01", status:"active", projects:1, mrr:7800  },
  { id:"c6", name:"Logística Norte",   industry:"Logística",    contact:"Pilar Mendoza",  email:"p.mendoza@lognorte.com",  phone:"+52 81 8800 1290", city:"Monterrey",   since:"2026-02-15", status:"paused", projects:1, mrr:0     },
];

export const PROJECTS_INIT: Project[] = [
  { id:"p1", name:"Pasta della Nonna — POS",          client:"c1", kind:"Point of sale",     status:"in_progress", progress:62,  start:"2026-01-15", due:"2026-06-20", team:["u1","u2","u3"],    health:"on_track", budget:220000, spent:124500, tasksDone:18, tasksTotal:29, accent:"#D72228" },
  { id:"p2", name:"Café Bruma — Web + reservas",       client:"c2", kind:"Web development",   status:"in_progress", progress:38,  start:"2026-02-01", due:"2026-06-05", team:["u2","u4"],         health:"at_risk",  budget:95000,  spent:41200,  tasksDone:11, tasksTotal:30, accent:"#1D1D1B" },
  { id:"p3", name:"Andamio MX — Portal interno",       client:"c3", kind:"Web app",           status:"review",      progress:88,  start:"2026-01-10", due:"2026-05-20", team:["u1","u3","u5"],    health:"on_track", budget:310000, spent:282000, tasksDone:41, tasksTotal:46, accent:"#2F4858" },
  { id:"p4", name:"Stickio — v2 multiusuario",         client:null, kind:"Producto interno",  status:"in_progress", progress:24,  start:"2026-03-01", due:"2026-09-30", team:["u1","u2","u4","u5"],health:"on_track", budget:0,      spent:0,      tasksDone:6,  tasksTotal:25, accent:"#B91C22" },
  { id:"p5", name:"Clínica Vera — Agenda online",      client:"c5", kind:"Web development",   status:"todo",        progress:5,   start:"2026-05-20", due:"2026-08-15", team:["u2","u4"],         health:"on_track", budget:78000,  spent:0,      tasksDone:1,  tasksTotal:18, accent:"#6B6B6B" },
  { id:"p6", name:"Logística Norte — Dashboard rutas", client:"c6", kind:"Web app",           status:"done",        progress:100, start:"2026-01-05", due:"2026-04-30", team:["u1","u3"],         health:"on_track", budget:180000, spent:175400, tasksDone:38, tasksTotal:38, accent:"#1D1D1B" },
  { id:"p7", name:"Prompt2Git — Auth + billing",       client:null, kind:"Producto interno",  status:"in_progress", progress:55,  start:"2026-02-20", due:"2026-07-10", team:["u1","u3"],         health:"on_track", budget:0,      spent:0,      tasksDone:14, tasksTotal:26, accent:"#D72228" },
];

export const COLUMNS = [
  { id:"backlog",  title:"Backlog",      hint:"Ideas y pendientes sin asignar" },
  { id:"todo",     title:"Por hacer",    hint:"Listo para empezar esta semana" },
  { id:"progress", title:"En progreso",  hint:"Trabajando activamente" },
  { id:"review",   title:"En revisión",  hint:"Pendiente de QA o aprobación" },
  { id:"done",     title:"Terminado",    hint:"Cerrado en los últimos 30 días" },
];

export const TASKS_INIT: Task[] = [
  { id:"t1",  col:"backlog",  project:"p1", title:"Integrar lector de códigos de barras USB", tag:"feature", priority:"med",  due:"2026-06-03", assignee:["u3"],      subtasks:[{t:"Compatibilidad HID",d:false},{t:"Mapeo de teclas",d:false}], comments:2, progress:{} },
  { id:"t2",  col:"backlog",  project:"p2", title:"Sistema de reservas con depósito",          tag:"feature", priority:"high", due:"2026-06-12", assignee:["u2","u3"], subtasks:[], comments:5, progress:{} },
  { id:"t3",  col:"backlog",  project:"p4", title:"Marketplace de stickers digitales",         tag:"idea",    priority:"low",  due:null,         assignee:["u1"],      subtasks:[], comments:1, progress:{} },
  { id:"t4",  col:"todo",     project:"p1", title:"Diseñar pantalla de cierre de caja",        tag:"design",  priority:"high", due:"2026-05-10", assignee:["u4"],      subtasks:[{t:"Wireframe",d:true},{t:"Hi-fi",d:false}], comments:3, progress:{} },
  { id:"t5",  col:"todo",     project:"p2", title:"Conectar formulario con n8n + email",       tag:"backend", priority:"med",  due:"2026-05-24", assignee:["u3"],      subtasks:[], comments:0, progress:{} },
  { id:"t6",  col:"todo",     project:"p5", title:"Definir alcance — Agenda online Vera",      tag:"planning",priority:"high", due:"2026-05-27", assignee:["u1","u2"], subtasks:[], comments:4, progress:{} },
  { id:"t7",  col:"todo",     project:"p7", title:"Página de pricing — Prompt2Git",            tag:"design",  priority:"med",  due:"2026-06-02", assignee:["u4"],      subtasks:[], comments:0, progress:{} },
  { id:"t8",  col:"progress", project:"p1", title:"Módulo de inventario con alertas de stock", tag:"feature", priority:"high", due:"2026-05-14", assignee:["u3","u2"], subtasks:[{t:"Modelo de datos",d:true},{t:"Endpoints",d:true},{t:"UI lista",d:false}], comments:7, progress:{u3:"progress"} },
  { id:"t9",  col:"progress", project:"p2", title:"Hero + sección de menú con animaciones",    tag:"frontend",priority:"med",  due:"2026-05-16", assignee:["u2"],      subtasks:[{t:"Hero",d:true},{t:"Menú",d:false}], comments:2, progress:{} },
  { id:"t10", col:"progress", project:"p4", title:"Migración a multiusuario con permisos",     tag:"backend", priority:"high", due:"2026-07-20", assignee:["u3","u5"], subtasks:[], comments:3, progress:{u3:"progress",u5:"todo"} },
  { id:"t11", col:"progress", project:"p7", title:"Stripe billing — planes Pro y Team",        tag:"backend", priority:"med",  due:"2026-06-21", assignee:["u1","u3"], subtasks:[{t:"Webhooks",d:true},{t:"Customer portal",d:false}], comments:1, progress:{u1:"done",u3:"progress"} },
  { id:"t12", col:"review",   project:"p3", title:"Reporte de cumplimiento por obra",          tag:"qa",      priority:"high", due:"2026-05-18", assignee:["u5"],      subtasks:[], comments:6, progress:{} },
  { id:"t13", col:"review",   project:"p3", title:"Permisos por rol — supervisor / capataz",   tag:"backend", priority:"med",  due:"2026-05-20", assignee:["u3"],      subtasks:[], comments:2, progress:{} },
  { id:"t14", col:"review",   project:"p1", title:"Impresión de tickets — formato 58mm",       tag:"qa",      priority:"med",  due:"2026-05-19", assignee:["u5","u2"], subtasks:[], comments:0, progress:{u5:"done",u2:"progress"} },
  { id:"t15", col:"done",     project:"p3", title:"Migrar base de datos a Postgres + RLS",     tag:"backend", priority:"high", due:"2026-04-20", assignee:["u3"],      subtasks:[], comments:4, progress:{u3:"done"} },
  { id:"t16", col:"done",     project:"p1", title:"Onboarding del cajero — 4 pasos",           tag:"design",  priority:"med",  due:"2026-04-15", assignee:["u4"],      subtasks:[], comments:2, progress:{u4:"done"} },
  { id:"t17", col:"done",     project:"p2", title:"Auditoría SEO inicial",                     tag:"planning",priority:"low",  due:"2026-04-30", assignee:["u1"],      subtasks:[], comments:1, progress:{u1:"done"} },
];

export const TAG_STYLES: Record<string, { label: string; cls: string }> = {
  feature:  { label:"Feature",    cls:"bg-tint text-zred" },
  backend:  { label:"Backend",    cls:"bg-[#1D1D1B] text-white" },
  frontend: { label:"Frontend",   cls:"bg-[#EEF2FF] text-[#3A47B5]" },
  design:   { label:"Diseño",     cls:"bg-[#FFF4DE] text-[#7A5A12]" },
  qa:       { label:"QA",         cls:"bg-[#E6F4EA] text-[#1E6B3C]" },
  planning: { label:"Planeación", cls:"bg-soft text-carbon" },
  idea:     { label:"Idea",       cls:"bg-[#F2EAFE] text-[#5A2EA6]" },
  bug:      { label:"Bug",        cls:"bg-[#FDECEC] text-[#B91C22]" },
};

export const PRIORITY: Record<string, { label: string; dot: string }> = {
  low:  { label:"Baja",  dot:"bg-[#A1A1A1]" },
  med:  { label:"Media", dot:"bg-[#E0A800]" },
  high: { label:"Alta",  dot:"bg-zred" },
};

export const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  todo:        { label:"Por iniciar",  cls:"bg-soft text-muted" },
  in_progress: { label:"En progreso",  cls:"bg-tint text-zred" },
  review:      { label:"En revisión",  cls:"bg-[#FFF4DE] text-[#7A5A12]" },
  done:        { label:"Terminado",    cls:"bg-[#E6F4EA] text-[#1E6B3C]" },
  paused:      { label:"Pausado",      cls:"bg-soft text-muted" },
  active:      { label:"Activo",       cls:"bg-[#E6F4EA] text-[#1E6B3C]" },
  lead:        { label:"Prospecto",    cls:"bg-tint text-zred" },
};

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(n);
}

export function daysUntil(iso: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

// ─── Learning ─────────────────────────────────────────────────────────────────

export type LearningResourceType = 'video' | 'course' | 'article' | 'book' | 'podcast';

export type LearningTask = {
  id: string;
  col: 'todo' | 'progress' | 'done';
  title: string;
  description: string;
  url: string;
  type: LearningResourceType;
  assignee: string[];
  due: string | null;
  duration: string;
  tags: string[];
  progress: Record<string, MemberProgress>;
};

export const LEARNING_RESOURCE: Record<LearningResourceType, { label: string; cls: string }> = {
  video:   { label:'Video',    cls:'bg-tint text-zred' },
  course:  { label:'Curso',    cls:'bg-[#EEF2FF] text-[#3A47B5]' },
  article: { label:'Artículo', cls:'bg-[#E6F4EA] text-[#1E6B3C]' },
  book:    { label:'Libro',    cls:'bg-[#FFF4DE] text-[#7A5A12]' },
  podcast: { label:'Podcast',  cls:'bg-[#F2EAFE] text-[#5A2EA6]' },
};

export const LEARNING_COLS = [
  { id:'todo',     title:'Por estudiar', hint:'Materiales pendientes de comenzar' },
  { id:'progress', title:'En curso',     hint:'Actualmente en proceso de aprendizaje' },
  { id:'done',     title:'Completado',   hint:'Material revisado y aprendido' },
];

// ─── Work Teams ───────────────────────────────────────────────────────────────

export type WorkTeam = {
  id: string;
  name: string;
  color: string;
  members: string[];
};

export const WORK_TEAMS_INIT: WorkTeam[] = [
  { id: 'wt1', name: 'Frontend',   color: '#3A47B5', members: ['u2', 'u4'] },
  { id: 'wt2', name: 'Backend',    color: '#1E6B3C', members: ['u1', 'u3'] },
  { id: 'wt3', name: 'QA',         color: '#6B6B6B', members: ['u5'] },
  { id: 'wt4', name: 'Núcleo',     color: '#D72228', members: ['u1', 'u2', 'u3', 'u4'] },
];

// ─── Activity Feed ─────────────────────────────────────────────────────────────

export type ActivityEvent = {
  id: string;
  type: 'task_done' | 'task_created' | 'comment' | 'project_created' | 'file_uploaded' | 'status_changed' | 'member_joined';
  userId: string;
  action: string;
  target: string;
  projectId?: string;
  ts: string;
};

const d = (daysAgo: number, h = 10, m = 0) => {
  const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(h, m, 0, 0); return dt.toISOString();
};

export const ACTIVITY_INIT: ActivityEvent[] = [
  { id:'a1',  type:'task_done',       userId:'u3', action:'completó la tarea',          target:'Migrar base de datos a Postgres + RLS',            projectId:'p3', ts: d(0,9,15) },
  { id:'a2',  type:'comment',         userId:'u5', action:'comentó en',                 target:'Reporte de cumplimiento por obra',                  projectId:'p3', ts: d(0,9,40) },
  { id:'a3',  type:'status_changed',  userId:'u2', action:'movió a En progreso',         target:'Hero + sección de menú con animaciones',           projectId:'p2', ts: d(0,10,5) },
  { id:'a4',  type:'task_done',       userId:'u4', action:'completó la tarea',          target:'Onboarding del cajero — 4 pasos',                   projectId:'p1', ts: d(0,11,20) },
  { id:'a5',  type:'comment',         userId:'u1', action:'comentó en',                 target:'Stripe billing — planes Pro y Team',                projectId:'p7', ts: d(0,14,0) },
  { id:'a6',  type:'file_uploaded',   userId:'u4', action:'subió un archivo en',        target:'Café Bruma — Web + reservas',                       projectId:'p2', ts: d(1,9,30) },
  { id:'a7',  type:'task_created',    userId:'u1', action:'creó la tarea',              target:'Página de pricing — Prompt2Git',                    projectId:'p7', ts: d(1,10,15) },
  { id:'a8',  type:'status_changed',  userId:'u3', action:'marcó para revisión',        target:'Permisos por rol — supervisor / capataz',           projectId:'p3', ts: d(1,11,50) },
  { id:'a9',  type:'comment',         userId:'u2', action:'comentó en',                 target:'Módulo de inventario con alertas de stock',         projectId:'p1', ts: d(1,16,10) },
  { id:'a10', type:'task_done',       userId:'u1', action:'completó la tarea',          target:'Auditoría SEO inicial',                             projectId:'p2', ts: d(2,9,0) },
  { id:'a11', type:'task_created',    userId:'u2', action:'creó la tarea',              target:'Conectar formulario con n8n + email',               projectId:'p2', ts: d(2,10,30) },
  { id:'a12', type:'project_created', userId:'u1', action:'creó el proyecto',           target:'Clínica Vera — Agenda online',                      projectId:'p5', ts: d(3,8,45) },
  { id:'a13', type:'file_uploaded',   userId:'u3', action:'subió documentación en',     target:'Andamio MX — Portal interno',                      projectId:'p3', ts: d(3,14,20) },
  { id:'a14', type:'member_joined',   userId:'u6', action:'se unió al workspace',       target:'',                                                              ts: d(8,9,0) },
  { id:'a15', type:'task_done',       userId:'u5', action:'completó la tarea',          target:'Impresión de tickets — formato 58mm',               projectId:'p1', ts: d(9,15,30) },
];

// ─── Task Templates ───────────────────────────────────────────────────────────

type TemplateTask = { title: string; tag: string; priority: 'low' | 'med' | 'high' };

export const TASK_TEMPLATES: Record<string, TemplateTask[]> = {
  'Web development': [
    { title: 'Reunión de descubrimiento y requerimientos',   tag: 'planning',  priority: 'high' },
    { title: 'Wireframes y arquitectura de información',     tag: 'design',    priority: 'high' },
    { title: 'Diseño UI — pantallas principales',            tag: 'design',    priority: 'high' },
    { title: 'Revisión de diseño con cliente',               tag: 'planning',  priority: 'med'  },
    { title: 'Configuración de entorno y repositorio',       tag: 'backend',   priority: 'high' },
    { title: 'Desarrollo de componentes base',               tag: 'frontend',  priority: 'high' },
    { title: 'Integración de CMS o base de datos',           tag: 'backend',   priority: 'med'  },
    { title: 'Desarrollo de páginas principales',            tag: 'frontend',  priority: 'high' },
    { title: 'Optimización SEO básica',                      tag: 'frontend',  priority: 'med'  },
    { title: 'Pruebas en dispositivos y navegadores',        tag: 'qa',        priority: 'high' },
    { title: 'Correcciones post-QA',                         tag: 'frontend',  priority: 'med'  },
    { title: 'Deploy a staging y revisión final',            tag: 'backend',   priority: 'high' },
    { title: 'Deploy a producción',                          tag: 'backend',   priority: 'high' },
    { title: 'Entrega y capacitación al cliente',            tag: 'planning',  priority: 'med'  },
  ],
  'Point of sale': [
    { title: 'Levantamiento de requerimientos del negocio',  tag: 'planning',  priority: 'high' },
    { title: 'Configuración inicial del sistema POS',        tag: 'backend',   priority: 'high' },
    { title: 'Alta de productos y categorías',               tag: 'planning',  priority: 'high' },
    { title: 'Configuración de impresoras y hardware',       tag: 'planning',  priority: 'med'  },
    { title: 'Diseño de pantalla de venta',                  tag: 'design',    priority: 'med'  },
    { title: 'Configuración de métodos de pago',             tag: 'backend',   priority: 'high' },
    { title: 'Integración con inventario',                   tag: 'backend',   priority: 'med'  },
    { title: 'Pruebas de flujo de venta completo',           tag: 'qa',        priority: 'high' },
    { title: 'Capacitación al personal de caja',             tag: 'planning',  priority: 'high' },
    { title: 'Capacitación al administrador',                tag: 'planning',  priority: 'med'  },
    { title: 'Pruebas en ambiente real — piloto',            tag: 'qa',        priority: 'high' },
    { title: 'Go-live y soporte en sitio',                   tag: 'planning',  priority: 'high' },
  ],
  'Restaurant solutions': [
    { title: 'Levantamiento de carta y precios',             tag: 'planning',  priority: 'high' },
    { title: 'Configuración de áreas y mesas',               tag: 'planning',  priority: 'high' },
    { title: 'Alta de productos en sistema',                 tag: 'planning',  priority: 'high' },
    { title: 'Diseño de pantalla de comandas',               tag: 'design',    priority: 'med'  },
    { title: 'Configuración de modificadores y notas',       tag: 'backend',   priority: 'med'  },
    { title: 'Integración con cocina — KDS',                 tag: 'backend',   priority: 'high' },
    { title: 'Configuración de propinas e impresión',        tag: 'backend',   priority: 'med'  },
    { title: 'Pruebas pedido → cocina → cobro',              tag: 'qa',        priority: 'high' },
    { title: 'Capacitación a meseros',                       tag: 'planning',  priority: 'high' },
    { title: 'Capacitación al administrador',                tag: 'planning',  priority: 'med'  },
    { title: 'Piloto en servicio real',                      tag: 'qa',        priority: 'high' },
    { title: 'Ajustes post-piloto',                          tag: 'backend',   priority: 'med'  },
    { title: 'Entrega y documentación',                      tag: 'planning',  priority: 'low'  },
  ],
  'Web app': [
    { title: 'Definición de requerimientos y user stories',  tag: 'planning',  priority: 'high' },
    { title: 'Arquitectura técnica y stack decision',         tag: 'backend',   priority: 'high' },
    { title: 'Diseño de base de datos',                      tag: 'backend',   priority: 'high' },
    { title: 'Wireframes y flujos de usuario',               tag: 'design',    priority: 'high' },
    { title: 'Diseño UI del sistema',                        tag: 'design',    priority: 'high' },
    { title: 'Configuración de repo y CI/CD',                tag: 'backend',   priority: 'high' },
    { title: 'Desarrollo de autenticación',                  tag: 'backend',   priority: 'high' },
    { title: 'Desarrollo de módulos principales',            tag: 'feature',   priority: 'high' },
    { title: 'API y endpoints',                              tag: 'backend',   priority: 'high' },
    { title: 'Pruebas e integración',                        tag: 'qa',        priority: 'med'  },
    { title: 'Revisión de seguridad',                        tag: 'qa',        priority: 'high' },
    { title: 'Deploy a staging y UAT con cliente',           tag: 'backend',   priority: 'high' },
    { title: 'Deploy a producción',                          tag: 'backend',   priority: 'high' },
  ],
  'Producto interno': [
    { title: 'Definir MVP y alcance inicial',                tag: 'planning',  priority: 'high' },
    { title: 'Prototipo rápido — proof of concept',          tag: 'backend',   priority: 'high' },
    { title: 'Diseño de interfaz v1',                        tag: 'design',    priority: 'med'  },
    { title: 'Desarrollo de funcionalidad core',             tag: 'feature',   priority: 'high' },
    { title: 'Testing interno',                              tag: 'qa',        priority: 'med'  },
    { title: 'Demo y recolección de feedback',               tag: 'planning',  priority: 'med'  },
    { title: 'Iteración v2 con mejoras',                     tag: 'feature',   priority: 'med'  },
    { title: 'Documentación técnica',                        tag: 'backend',   priority: 'low'  },
  ],
  'Consultoría': [
    { title: 'Reunión inicial y diagnóstico',                tag: 'planning',  priority: 'high' },
    { title: 'Análisis de procesos actuales',                tag: 'planning',  priority: 'high' },
    { title: 'Elaboración de propuesta y roadmap',           tag: 'planning',  priority: 'high' },
    { title: 'Presentación de propuesta al cliente',         tag: 'planning',  priority: 'high' },
    { title: 'Implementación de recomendaciones — Fase 1',   tag: 'feature',   priority: 'high' },
    { title: 'Seguimiento y ajuste',                         tag: 'planning',  priority: 'med'  },
    { title: 'Informe final de resultados',                  tag: 'planning',  priority: 'med'  },
  ],
  'Otro': [
    { title: 'Definir alcance y objetivos',                  tag: 'planning',  priority: 'high' },
    { title: 'Planificación y cronograma',                   tag: 'planning',  priority: 'high' },
    { title: 'Ejecución — Fase 1',                           tag: 'feature',   priority: 'med'  },
    { title: 'Revisión de avance',                           tag: 'planning',  priority: 'med'  },
    { title: 'Entrega final',                                tag: 'planning',  priority: 'high' },
  ],
};

export const LEARNING_INIT: LearningTask[] = [
  { id:'l1', col:'todo',     title:'Next.js 15 — App Router completo',              description:'Curso oficial de Vercel sobre el nuevo App Router, Server Components y optimizaciones de rendimiento.', url:'https://nextjs.org/learn',                                              type:'course',  assignee:['u2','u3'],      due:'2026-06-15', duration:'8 h',       tags:['Frontend','React'],           progress:{} },
  { id:'l2', col:'todo',     title:'Supabase — Auth + RLS en profundidad',          description:'Aprende Row Level Security, políticas de acceso y autenticación con Supabase.',                          url:'https://supabase.com/docs',                                             type:'course',  assignee:['u1','u3'],      due:'2026-06-20', duration:'6 h',       tags:['Backend','Database'],         progress:{} },
  { id:'l3', col:'todo',     title:'Tailwind CSS v4 — Novedades y migración',       description:'Video resumen de todos los cambios de Tailwind v4: CSS-first config, @theme, nuevo motor.',              url:'https://tailwindcss.com/blog/tailwindcss-v4',                           type:'video',   assignee:['u2','u4'],      due:'2026-06-05', duration:'45 min',    tags:['Frontend','CSS'],             progress:{} },
  { id:'l4', col:'todo',     title:'Figma Variables — Design tokens avanzados',     description:'Cómo usar Variables en Figma para mantener un sistema de diseño escalable y consistente.',               url:'https://help.figma.com/hc/en-us/articles/15339657135383',               type:'article', assignee:['u4'],           due:'2026-05-30', duration:'30 min',    tags:['Diseño','Tokens'],            progress:{} },
  { id:'l5', col:'progress', title:'TypeScript avanzado — Tipos genéricos',         description:'Profundiza en Generic types, Conditional types, Mapped types y el sistema de tipos de TS 5+.',           url:'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html',  type:'article', assignee:['u2','u3'],      due:'2026-05-28', duration:'3 h',       tags:['TypeScript','Backend'],       progress:{u2:'progress',u3:'todo'} },
  { id:'l6', col:'progress', title:'Accesibilidad web — WCAG 2.2 para equipos',    description:'Guía práctica de accesibilidad: roles ARIA, navegación por teclado, contraste y semántica HTML.',        url:'https://www.w3.org/WAI/WCAG22/quickref/',                               type:'article', assignee:['u2','u4'],      due:'2026-06-01', duration:'2 h',       tags:['Frontend','Diseño'],          progress:{u2:'done',u4:'progress'} },
  { id:'l7', col:'progress', title:'Podcast: Syntax.fm — Modern CSS en 2026',      description:'Episodio de Syntax donde Wes y Scott cubren CSS Grid subgrid, container queries y @layer.',               url:'https://syntax.fm',                                                     type:'podcast', assignee:['u2'],           due:null,          duration:'1 h 10 min', tags:['CSS','Frontend'],             progress:{} },
  { id:'l8', col:'done',     title:"React 19 — What's new",                         description:'Repaso de todas las novedades de React 19: Actions, optimistic updates, use() hook y mejoras al compilador.', url:'https://react.dev/blog/2024/12/05/react-19',                        type:'article', assignee:['u1','u2','u3'], due:'2026-05-15', duration:'1 h',       tags:['React','Frontend'],           progress:{u1:'done',u2:'done',u3:'done'} },
  { id:'l9', col:'done',     title:'Clean Code — Robert C. Martin',                 description:'Los principios de código limpio aplicados a proyectos modernos de JavaScript y TypeScript.',               url:'https://www.oreilly.com/library/view/clean-code-a/9780136083238/',     type:'book',    assignee:['u1','u3','u5'], due:'2026-05-10', duration:'12 h',      tags:['Arquitectura','Best practices'], progress:{u1:'done',u3:'done',u5:'done'} },
];
