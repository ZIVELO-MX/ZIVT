export const PERMISSIONS = {
  founder: { label:"Founder",  desc:"Propietario del workspace con control absoluto",   cls:"bg-tint text-zred" },
  admin:   { label:"Admin",    desc:"Control total del workspace, billing y miembros",  cls:"bg-tint text-zred" },
  editor:  { label:"Editor",   desc:"Crear y editar proyectos, tareas y clientes",      cls:"bg-[#EEF2FF] text-[#3A47B5]" },
  viewer:  { label:"Lectura",  desc:"Solo puede ver el contenido del workspace",        cls:"bg-soft text-carbon" },
} as const;

export const USER_STATUS = {
  active:    { label:"Activo",             cls:"bg-[#E6F4EA] text-[#1E6B3C]" },
  invited:   { label:"Invitación enviada", cls:"bg-[#FFF4DE] text-[#7A5A12]" },
  suspended: { label:"Suspendido",         cls:"bg-tint text-zred" },
} as const;

export const COLUMNS = [
  { id:"backlog",  title:"Backlog",      hint:"Ideas y pendientes sin asignar" },
  { id:"todo",     title:"Por hacer",    hint:"Listo para empezar esta semana" },
  { id:"progress", title:"En progreso",  hint:"Trabajando activamente" },
  { id:"review",   title:"En revisión",  hint:"Pendiente de QA o aprobación" },
  { id:"done",     title:"Terminado",    hint:"Cerrado en los últimos 30 días" },
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

export const LEARNING_RESOURCE: Record<string, { label: string; cls: string }> = {
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
