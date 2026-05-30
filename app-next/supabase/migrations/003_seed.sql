-- ============================================================
-- 003_seed.sql — Datos iniciales (equivalente a lib/data.ts)
-- Ejecutar DESPUÉS de 001 y 002
-- IMPORTANTE: Reemplaza los UUIDs de profiles con los IDs
-- reales de tus usuarios en Supabase Auth → Users
-- ============================================================

-- ── PROJECTS ──────────────────────────────────────────────
insert into public.projects (id, name, client, kind, status, health, progress, tasks_done, tasks_total, budget, spent, start_date, due_date, accent, team) values
  ('p1','Sistema de punto de venta','Andamio MX','App móvil','in_progress','on_track',72,18,25,85000,61200,'2026-01-15','2026-06-30','#D72228',array['u1','u2','u3','u5']),
  ('p2','Web + reservas','Café Bruma','Sitio web','in_progress','at_risk',38,9,24,42000,16000,'2026-02-01','2026-05-31','#3A47B5',array['u2','u4']),
  ('p3','Portal interno de obra','Andamio MX','Web app','review','on_track',91,21,23,120000,109000,'2025-11-01','2026-04-30','#1E6B3C',array['u1','u3','u5']),
  ('p4','Agenda online','Clínica Vera','Web app','todo','on_track',0,0,12,28000,0,'2026-05-01','2026-07-31','#7A5A12',array['u2','u4']),
  ('p5','E-commerce','Ferretería Don Pepe','Tienda online','in_progress','on_track',55,11,20,65000,35750,'2026-02-15','2026-07-15','#5A2EA6',array['u3','u4']),
  ('p6','Rediseño de marca','Café Bruma','Branding','done','on_track',100,8,8,18000,18000,'2026-01-10','2026-03-15','#B91C22',array['u4']),
  ('p7','Panel SaaS','Prompt2Git','Dashboard','in_progress','at_risk',28,5,18,95000,26600,'2026-03-01','2026-08-31','#D72228',array['u1','u2','u3','u4','u5'])
on conflict (id) do nothing;

-- ── TASKS ─────────────────────────────────────────────────
insert into public.tasks (id, col, project, title, tag, priority, due, assignee, subtasks, comments, progress) values
  ('t1','todo','p1','Módulo de inventario con alertas de stock','Backend','high','2026-06-10',array['u3'],
    '[{"t":"Modelo de datos inventario","d":true},{"t":"API de alertas","d":false},{"t":"UI de alertas","d":false}]'::jsonb,2,'{"u3":"todo"}'::jsonb),
  ('t2','todo','p2','Hero + sección de menú con animaciones','Frontend','med','2026-05-28',array['u2','u4'],
    '[{"t":"Diseño en Figma","d":true},{"t":"Implementar hero","d":false},{"t":"Animaciones CSS","d":false}]'::jsonb,0,'{"u2":"todo","u4":"todo"}'::jsonb),
  ('t3','todo','p7','Página de pricing — Prompt2Git','Frontend','high','2026-06-05',array['u1','u2'],
    '[{"t":"Copy pricing","d":false},{"t":"Componente de tarjetas","d":false}]'::jsonb,1,'{"u1":"todo","u2":"todo"}'::jsonb),
  ('t4','progress','p1','Onboarding del cajero — 4 pasos','Frontend','med','2026-05-30',array['u2','u4'],
    '[{"t":"Paso 1: Bienvenida","d":true},{"t":"Paso 2: Productos","d":true},{"t":"Paso 3: Cobro","d":false},{"t":"Paso 4: Reportes","d":false}]'::jsonb,3,'{"u2":"progress","u4":"done"}'::jsonb),
  ('t5','progress','p3','Permisos por rol — supervisor / capataz','Backend','high','2026-05-25',array['u1','u3'],
    '[{"t":"Definir roles","d":true},{"t":"Middleware de permisos","d":true},{"t":"Tests de acceso","d":false}]'::jsonb,5,'{"u1":"progress","u3":"progress"}'::jsonb),
  ('t6','progress','p7','Stripe billing — planes Pro y Team','Backend','high','2026-06-15',array['u1','u3'],
    '[{"t":"Crear productos en Stripe","d":true},{"t":"Webhook de pagos","d":false},{"t":"Portal de facturación","d":false}]'::jsonb,2,'{"u1":"progress","u3":"todo"}'::jsonb),
  ('t7','review','p3','Reporte de cumplimiento por obra','Backend','med','2026-05-20',array['u5'],
    '[{"t":"Template PDF","d":true},{"t":"Generación automática","d":true},{"t":"Envío por email","d":false}]'::jsonb,4,'{"u5":"progress"}'::jsonb),
  ('t8','review','p5','Catálogo de productos con filtros','Frontend','med','2026-06-01',array['u3','u4'],
    '[{"t":"Grid de productos","d":true},{"t":"Filtros laterales","d":true},{"t":"Búsqueda en tiempo real","d":false}]'::jsonb,1,'{"u3":"progress","u4":"done"}'::jsonb),
  ('t9','done','p3','Migrar base de datos a Postgres + RLS','Backend','high','2026-05-10',array['u3'],
    '[{"t":"Schema SQL","d":true},{"t":"RLS policies","d":true},{"t":"Seed data","d":true}]'::jsonb,0,'{"u3":"done"}'::jsonb),
  ('t10','done','p1','Dashboard de ventas diarias','Frontend','med','2026-05-15',array['u2','u3'],
    '[{"t":"Diseño del dashboard","d":true},{"t":"API de métricas","d":true},{"t":"Charts interactivos","d":true}]'::jsonb,2,'{"u2":"done","u3":"done"}'::jsonb)
on conflict (id) do nothing;

-- ── CLIENTS ───────────────────────────────────────────────
insert into public.clients (id, name, industry, contact, email, phone, city, status, mrr, since, projects) values
  ('c1','Andamio MX','Construcción','Roberto Sánchez','contacto@andamiomx.com','—','CDMX','active',18500,'2025-11-01',2),
  ('c2','Café Bruma','Restaurantes','Valentina Cruz','hola@cafebruma.mx','—','Guadalajara','active',4200,'2026-02-01',2),
  ('c3','Clínica Vera','Salud','Dr. Ernesto Vera','administracion@clinicavera.com','—','Monterrey','active',3800,'2026-05-01',1),
  ('c4','Ferretería Don Pepe','Retail','José Martínez','ventas@donpepe.mx','—','Zapopan','active',5600,'2026-02-15',1),
  ('c5','Prompt2Git','SaaS','Raúl Méndez','hola@prompt2git.com','—','Remoto','active',12000,'2026-03-01',1),
  ('c6','TechLatam','Tecnología','Andrea Morales','andrea@techlatam.io','—','CDMX','lead',0,'2026-05-20',0)
on conflict (id) do nothing;
