'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Ic } from '@/components/icons'
import { Card, Badge, Button, IconButton, Avatar, AvatarStack, Input, Drawer, Modal, ProgressBar, Tag } from './ui'
import { CustomDatePicker as DatePicker, CustomSelect } from './controls'
import { TEAM, COLUMNS, TAG_STYLES, PRIORITY, STATUS_LABEL, TASKS_INIT, PROJECTS_INIT, formatDate, formatMoney, daysUntil } from '@/lib/data'
import { ConfirmDialog, FiltersDrawer } from './modals'
import { createTask, updateTask, deleteTask, moveTask } from '@/lib/supabase/queries'
import { notifyTaskCompleted, notifyTaskCreated } from '@/lib/supabase/notify'

const PROG_COLOR: Record<string, string> = {
  todo:     '#D1D1CE',
  progress: '#E0B84A',
  done:     '#3CB371',
}
const PROG_STATUS = [
  { value: 'todo',     label: 'Pendiente',  color: '#9B9B98' },
  { value: 'progress', label: 'En curso',   color: '#E0B84A' },
  { value: 'done',     label: 'Completado', color: '#3CB371' },
]

function MemberProgressStack({ members, progress }: { members: any[]; progress: Record<string, string> }) {
  const doneCount = members.filter(u => progress?.[u.id] === 'done').length;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center -space-x-1.5">
        {members.slice(0, 3).map(u => (
          <div key={u.id} style={{ display: 'inline-flex', borderRadius: '50%', border: `2px solid ${PROG_COLOR[progress?.[u.id] || 'todo']}` }}>
            <Avatar user={u} size={22} />
          </div>
        ))}
        {members.length > 3 && (
          <span className="text-[10px] text-muted ml-2">+{members.length - 3}</span>
        )}
      </div>
      {members.length > 1 && (
        <span className="text-[10.5px] text-muted font-medium nums">{doneCount}/{members.length}</span>
      )}
    </div>
  )
}

function PriorityDot({ priority }: any) {
  const p = PRIORITY[priority];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

function TaskCard({ task, projects, onClick, onDragStart, onDragEnd, dragging }: any) {
  const project = projects.find(p => p.id === task.project);
  const team = task.assignee.map(id => TEAM.find(u => u.id === id)).filter(Boolean);
  const days = daysUntil(task.due);
  const overdue = task.due && days < 0 && task.col !== 'done';
  const soon = task.due && days >= 0 && days <= 3 && task.col !== 'done';
  const subDone = task.subtasks.filter(s => s.d).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className={`group bg-white border border-line2 rounded-md p-3.5 cursor-grab active:cursor-grabbing hover:border-zred/30 hover:shadow-soft transition-all ${dragging ? 'dragging' : ''}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: project?.accent || '#1D1D1B' }} />
          <span className="text-[11px] font-semibold text-muted truncate">{project?.name}</span>
        </div>
        <Tag tag={task.tag} />
      </div>

      <h4 className="text-[13.5px] font-semibold leading-snug mb-3 text-carbon" style={{textWrap:'pretty'}}>
        {task.title}
      </h4>

      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10.5px] text-muted mb-1">
            <span className="font-medium">{subDone}/{task.subtasks.length} subtareas</span>
          </div>
          <div className="h-1 bg-soft rounded-full overflow-hidden">
            <div className="h-full bg-carbon rounded-full" style={{ width: `${(subDone/task.subtasks.length)*100}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PriorityDot priority={task.priority} />
          {task.comments > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Ic.Chat width="11" height="11"/> {task.comments}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.due && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold nums
              ${overdue ? 'bg-tint text-zred' : soon ? 'bg-[#FFF4DE] text-[#7A5A12]' : 'text-muted'}`}>
              <Ic.Clock width="10" height="10"/>
              {new Date(task.due).toLocaleDateString('es-MX',{day:'2-digit', month:'short'})}
            </span>
          )}
          <MemberProgressStack members={team} progress={task.progress} />
        </div>
      </div>
    </div>
  );
}

function Column({ col, tasks, projects, onDrop, onDragOver, onDragLeave, isOver, onCardClick, onCardDragStart, onCardDragEnd, draggingId, onAdd, onRename, onClear, onSoon }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(col.title);
  const menuRef = useRef(null);
  const COL_COLORS = {
    backlog:  '#6B6B6B',
    todo:     '#1D1D1B',
    progress: '#D72228',
    review:   '#E0A800',
    done:     '#1E6B3C',
  };
  useEffect(() => setTitleDraft(col.title), [col.title]);
  useEffect(() => {
    function onDown(e) {
      if (!menuOpen) return;
      if (menuRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setRenaming(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function saveTitle() {
    const next = titleDraft.trim();
    if (next) onRename(col.id, next);
    setRenaming(false);
  }

  return (
    <div
      onDragOver={(e) => onDragOver(e, col.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, col.id)}
      className={`w-[300px] shrink-0 bg-soft/70 rounded-lg p-3 flex flex-col gap-3 border border-transparent transition-colors ${isOver ? 'drag-over' : ''}`}
      style={{ maxHeight: 'calc(100vh - 220px)' }}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{background: COL_COLORS[col.id]}} />
          {renaming ? (
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') { setTitleDraft(col.title); setRenaming(false); }
              }}
              className="h-7 w-32 px-2 rounded border border-line bg-white text-[13px] font-bold outline-none focus:border-zred"
              autoFocus
            />
          ) : (
            <h3 className="text-[13px] font-bold tracking-tight">{col.title}</h3>
          )}
          <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full bg-white border border-line2 text-[11px] font-bold nums">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onAdd(col.id)} className="w-7 h-7 rounded hover:bg-white inline-flex items-center justify-center text-muted hover:text-carbon">
            <Ic.Plus width="14" height="14"/>
          </button>
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(open => !open)} className="w-7 h-7 rounded hover:bg-white inline-flex items-center justify-center text-muted">
              <Ic.Dots width="14" height="14"/>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-md border border-line2 bg-white shadow-pop p-1 pop-in">
                <button onClick={() => { setMenuOpen(false); setRenaming(true); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Edit width="13" height="13" className="text-muted"/> Renombrar columna
                </button>
                <button onClick={() => { setMenuOpen(false); onClear(col); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Trash width="13" height="13" className="text-muted"/> Limpiar tareas
                </button>
                <button onClick={() => { setMenuOpen(false); onSoon('Archivar columna estará disponible próximamente.'); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Folder width="13" height="13" className="text-muted"/> Archivar columna
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-1 text-[11px] text-muted -mt-1">{col.hint}</div>

      <div className="flex-1 overflow-y-auto scroll-thin space-y-2 pb-1">
        {tasks.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            projects={projects}
            dragging={draggingId === t.id}
            onClick={onCardClick}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 px-3 border-2 border-dashed border-line rounded-md text-muted">
            <div className="w-8 h-8 rounded-full bg-white border border-line2 inline-flex items-center justify-center mb-2">
              <Ic.Plus width="14" height="14"/>
            </div>
            <div className="text-[11.5px]">Suelta tarjetas aquí</div>
          </div>
        )}
      </div>

      <button onClick={() => onAdd(col.id)} className="text-[12px] font-semibold text-muted hover:text-zred text-left px-1 py-1.5">
        + Añadir tarea
      </button>
    </div>
  );
}

function TaskDetail({ task, projects, onClose, onUpdate, onDelete, comments, onAddComment }: any) {
  if (!task) return null;
  const project = projects.find(p => p.id === task.project);

  const [edit, setEdit] = useState({ ...task, description: task.description || '' });
  const [saved, setSaved] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingSub, setEditingSub] = useState(false);

  useEffect(() => {
    setEdit({ ...task, description: task.description || '' });
    setSaved(false);
    setEditingSub(false);
  }, [task]);

  const set = (k, v) => setEdit(f => ({ ...f, [k]: v }));

  function save() {
    const prog = edit.progress || {};
    const allDone = edit.assignee?.length > 0 && edit.assignee.every(id => prog[id] === 'done');
    onUpdate({ ...edit, comments: task.comments, ...(allDone ? { col: 'done' } : {}) });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function toggleSub(idx) {
    const sub = [...edit.subtasks];
    sub[idx] = { ...sub[idx], d: !sub[idx].d };
    set('subtasks', sub);
  }

  function addSubtask() {
    if (!newSubtask.trim()) return;
    set('subtasks', [...edit.subtasks, { t: newSubtask.trim(), d: false }]);
    setNewSubtask('');
    setEditingSub(false);
  }

  function handleCommentSubmit(e) {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment.trim());
    setNewComment('');
  }

  return (
    <Drawer open onClose={onClose} title="Detalle de tarea" width={520}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="danger" size="sm" onClick={() => { onDelete(task.id); onClose(); }}>
            <Ic.Trash width="14" height="14"/> Eliminar
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
            <Button variant="primary" size="sm" onClick={save}>
              {saved ? 'Guardado ✓' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      }>
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{background: project?.accent}}/>
          <span className="text-[12px] font-semibold text-muted">{project?.name}</span>
          <Tag tag={task.tag} />
        </div>

        <input value={edit.title} onChange={(e) => set('title', e.target.value)}
          className="w-full text-[20px] font-bold tracking-tight leading-snug bg-transparent border-b border-transparent hover:border-line focus:border-zred outline-none transition-colors" />

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Estado</div>
            <select value={edit.col} onChange={(e) => set('col', e.target.value)}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Prioridad</div>
            <select value={edit.priority} onChange={(e) => set('priority', e.target.value)}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Vencimiento</div>
            <input type="date" value={edit.due || ''} onChange={(e) => set('due', e.target.value || null)}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Asignados</div>
            <div className="flex flex-wrap gap-1">
              {TEAM.map(u => {
                const on = edit.assignee?.includes(u.id);
                return (
                  <button key={u.id} type="button" onClick={() => set('assignee', on ? edit.assignee.filter(x => x !== u.id) : [...(edit.assignee || []), u.id])}
                    className={`w-7 h-7 rounded-full text-[10px] font-bold text-white transition-all ${on ? 'ring-2 ring-offset-1 ring-zred scale-110' : 'opacity-50 hover:opacity-100'}`}
                    style={{background: u.color}} title={u.name}>
                    {u.initials}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {edit.assignee?.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Progreso por persona</div>
            <div className="space-y-2">
              {edit.assignee.map(uid => {
                const u = TEAM.find(m => m.id === uid);
                if (!u) return null;
                const status = edit.progress?.[uid] || 'todo';
                return (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size={28} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{u.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {PROG_STATUS.map(s => (
                        <button key={s.value} onClick={() => set('progress', { ...(edit.progress || {}), [uid]: s.value })}
                          title={s.label}
                          className={`px-2.5 h-7 rounded-full text-[11px] font-semibold border transition-all ${
                            status === s.value ? 'text-white border-transparent' : 'bg-white border-line text-muted hover:border-line2'
                          }`}
                          style={status === s.value ? { background: s.color, borderColor: s.color } : undefined}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">Subtareas</div>
            {!editingSub && (
              <button onClick={() => setEditingSub(true)} className="text-[12px] font-semibold text-zred hover:underline">+ Añadir</button>
            )}
          </div>
          {editingSub && (
            <div className="flex items-center gap-2 mb-2">
              <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                placeholder="Nombre de la subtarea..." autoFocus
                className="flex-1 h-9 px-3 rounded-md border border-line text-[13px] bg-white outline-none focus:border-zred" />
              <button onClick={addSubtask} className="w-9 h-9 rounded-md bg-zred text-white flex items-center justify-center hover:bg-zred2 transition-colors">
                <Ic.Check width="14" height="14"/>
              </button>
              <button onClick={() => { setEditingSub(false); setNewSubtask(''); }} className="w-9 h-9 rounded-md border border-line flex items-center justify-center text-muted hover:text-carbon">
                <Ic.X width="14" height="14"/>
              </button>
            </div>
          )}
          {edit.subtasks.length === 0 ? (
            <div className="text-[13px] text-muted">Sin subtareas aún.</div>
          ) : (
            <div className="space-y-1">
              {edit.subtasks.map((s, i) => (
                <button key={i} onClick={() => toggleSub(i)} className="w-full flex items-center gap-3 py-2 px-2 rounded hover:bg-soft text-left">
                  <span className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors ${s.d ? 'bg-zred border-zred text-white' : 'border-line bg-white'}`}>
                    {s.d && <Ic.Check width="12" height="12"/>}
                  </span>
                  <span className={`text-[13.5px] ${s.d ? 'line-through text-muted' : 'text-carbon'}`}>{s.t}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Descripción</div>
          <textarea value={edit.description || ''} onChange={(e) => set('description', e.target.value)}
            placeholder="Especifica los criterios de aceptación, mockups relevantes y dependencias técnicas."
            className="w-full rounded-md border border-line2 p-3 text-[13.5px] text-carbon leading-relaxed bg-transparent resize-none min-h-[100px]" />
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Comentarios</div>
          <div className="space-y-3 text-[13px] mb-3">
            {comments.map(c => {
              const user = TEAM.find(u => u.id === c.userId);
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar user={user} size={26}/>
                  <div className="flex-1 bg-soft rounded-md p-3">
                    <div className="text-[12px] text-muted mb-1">
                      <span className="font-semibold text-carbon">{user?.name?.split(' ')[0]}</span>
                      {' · '}{new Date(c.timestamp).toLocaleDateString('es-MX', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                    </div>
                    <div>{c.text}</div>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <div className="text-[13px] text-muted text-center py-4">Sin comentarios aún.</div>
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <Avatar user={TEAM[0]} size={28}/>
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 h-10 px-3.5 rounded-full bg-soft border border-transparent text-[13px] outline-none focus:border-zred/30" />
            <button type="submit" disabled={!newComment.trim()}
              className="w-10 h-10 rounded-full bg-zred text-white flex items-center justify-center disabled:opacity-50 hover:bg-zred2 transition-colors">
              <Ic.Arrow width="14" height="14"/>
            </button>
          </form>
        </div>
      </div>
    </Drawer>
  );
}

function NewTaskModal({ open, defaultCol, projects, onClose, onCreate }: any) {
  const [form, setForm] = useState({ title:'', project: projects[0]?.id, priority:'med', col: defaultCol || 'todo', tag:'feature', due:'', assignee: [] as string[] });
  useEffect(() => { if (open) setForm(f => ({ ...f, col: defaultCol || 'todo', assignee: [] })); }, [open, defaultCol]);

  function toggleAssignee(id: string) {
    setForm(f => ({ ...f, assignee: f.assignee.includes(id) ? f.assignee.filter(x => x !== id) : [...f.assignee, id] }));
  }

  function submit() {
    if (!form.title.trim()) return;
    onCreate({
      id: 't' + Date.now(),
      col: form.col, project: form.project, title: form.title.trim(),
      tag: form.tag, priority: form.priority, due: form.due || null,
      assignee: form.assignee.length > 0 ? form.assignee : ['u1'],
      subtasks: [], comments: 0, progress: {},
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva tarea"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={submit}><Ic.Plus width="14" height="14"/> Crear tarea</Button>
      </>}>
      <div className="space-y-4">
        <Input label="Título" placeholder="¿Qué hay que hacer?" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} autoFocus/>
        <div className="grid grid-cols-2 gap-3">
          <CustomSelect label="Proyecto" value={form.project} onChange={(e)=>setForm({...form, project:e.target.value})}
            options={projects.map(p => ({ value: p.id, label: p.name }))}/>
          <CustomSelect label="Columna" value={form.col} onChange={(e)=>setForm({...form, col:e.target.value})}
            options={COLUMNS.map(c => ({ value: c.id, label: c.title }))}/>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CustomSelect label="Etiqueta" value={form.tag} onChange={(e)=>setForm({...form, tag:e.target.value})}
            options={Object.keys(TAG_STYLES).map(k => ({ value: k, label: TAG_STYLES[k].label }))}/>
          <CustomSelect label="Prioridad" value={form.priority} onChange={(e)=>setForm({...form, priority:e.target.value})}
            options={[{value:'low',label:'Baja'},{value:'med',label:'Media'},{value:'high',label:'Alta'}]}/>
          <DatePicker label="Vence" value={form.due} onChange={(e)=>setForm({...form, due:e.target.value})}/>
        </div>
        <div>
          <div className="text-[12px] font-semibold text-carbon mb-2 uppercase tracking-wider">Asignar a</div>
          <div className="flex flex-wrap gap-2">
            {TEAM.map(u => {
              const on = form.assignee.includes(u.id);
              return (
                <button key={u.id} type="button" onClick={() => toggleAssignee(u.id)}
                  className={`flex items-center gap-2 pl-1 pr-3 h-9 rounded-full border transition-all ${on ? 'bg-carbon text-white border-carbon' : 'bg-white text-carbon border-line hover:border-zred/40'}`}>
                  <Avatar user={u} size={26} />
                  <span className="text-[12.5px] font-semibold">{u.name.split(' ')[0]}</span>
                  {on && <Ic.Check width="13" height="13"/>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Kanban({ tasks, setTasks, projects }) {
  const taskListRef = useRef(tasks);
  useEffect(() => { taskListRef.current = tasks; }, [tasks]);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [openTask, setOpenTask] = useState(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskCol, setNewTaskCol] = useState('todo');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ assignees:[], tags:[], priorities:[], due:'all', sort:'recent' });
  const [draft, setDraft] = useState(filters);
  const [taskComments, setTaskComments] = useState<Record<string, any[]>>({});
  const [columnTitles, setColumnTitles] = useState(() => Object.fromEntries(COLUMNS.map(c => [c.id, c.title])));
  const [confirmClear, setConfirmClear] = useState(null);
  const [toast, setToast] = useState('');
  const toastRef = useRef<number | undefined>(undefined);

  const activeFilterCount = filters.assignees.length + filters.tags.length + filters.priorities.length + (filters.due !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    const result = tasks.filter(t => {
      if (projectFilter !== 'all' && t.project !== projectFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.assignees.length > 0 && !t.assignee.some(a => filters.assignees.includes(a))) return false;
      if (filters.tags.length > 0 && !filters.tags.includes(t.tag)) return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) return false;
      if (filters.due !== 'all') {
        const days = t.due ? daysUntil(t.due) : null;
        if (filters.due === 'none' && t.due) return false;
        if (filters.due === 'overdue' && (!t.due || days >= 0 || t.col === 'done')) return false;
        if (filters.due === 'today' && days !== 0) return false;
        if (filters.due === 'week' && (days === null || days < 0 || days > 7)) return false;
      }
      return true;
    });
    if (filters.sort === 'due') {
      result.sort((a, b) => (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99'));
    } else if (filters.sort === 'priority') {
      const order = { high: 0, med: 1, low: 2 };
      result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
    } else if (filters.sort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [tasks, search, projectFilter, filters]);

  function onDragStart(e, task) {
    setDraggingId(task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  }
  function onDragEnd() { setDraggingId(null); setOverCol(null); }
  function onDragOver(e, colId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverCol(colId); }
  function onDragLeave() { setOverCol(null); }
  function onDrop(e, colId) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const snapshot = taskListRef.current;
    const task = snapshot.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (colId === 'done') {
        const prog = { ...t.progress };
        t.assignee.forEach(uid => { prog[uid] = 'done'; });
        return { ...t, col: colId, progress: prog };
      }
      return { ...t, col: colId };
    }));
    setDraggingId(null); setOverCol(null);
    const progress = colId === 'done'
      ? Object.fromEntries(task.assignee.map(uid => [uid, 'done' as const]))
      : undefined;
    moveTask(id, colId, progress)
      .then(() => {
        if (task.col !== 'done' && colId === 'done') {
          notifyTaskCompleted(task.title, TEAM[0]?.id ?? '');
        }
      })
      .catch(() => {
        setTasks(snapshot);
        showToast('Error al mover la tarea');
      });
  }

  function onAddComment(taskId, text) {
    const comment = { id: 'c' + Date.now(), text, userId: 'u1', timestamp: new Date().toISOString() };
    setTaskComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), comment] }));
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: (t.comments || 0) + 1 } : t));
  }
  function renameColumn(id, title) {
    setColumnTitles(prev => ({ ...prev, [id]: title }));
  }
  function showToast(message) {
    setToast(message);
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setToast(''), 2200);
  }
  async function clearColumn() {
    const target = confirmClear;
    setConfirmClear(null);
    if (!target) return;
    const snapshot = taskListRef.current;
    const colTasks = snapshot.filter(t => t.col === target.id);
    setTasks(prev => prev.filter(t => t.col !== target.id));
    try {
      await Promise.all(colTasks.map(t => deleteTask(t.id)));
      showToast(`Columna ${target.title} limpiada.`);
    } catch {
      setTasks(snapshot);
      showToast('Error al limpiar la columna');
    }
  }
  const columns = COLUMNS.map(col => ({ ...col, title: columnTitles[col.id] || col.title }));

  return (
    <div className="px-8 py-6 flex flex-col" style={{minHeight:'calc(100vh - 72px)'}}>
      {toast && (
        <div className="fixed right-6 bottom-6 z-[80] rounded-md bg-carbon text-white shadow-pop px-4 py-3 text-[13px] font-semibold pop-in">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-line w-full max-w-[320px]">
          <Ic.Search width="15" height="15" className="text-muted"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar tarea..." className="bg-transparent outline-none text-[13.5px] flex-1"/>
        </div>

        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1">
          <button onClick={()=>setProjectFilter('all')} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold ${projectFilter==='all'?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>Todos</button>
          {projects.slice(0,4).map(p => (
            <button key={p.id} onClick={()=>setProjectFilter(p.id)}
              className={`px-3 h-8 rounded-full text-[12.5px] font-semibold flex items-center gap-1.5 ${projectFilter===p.id?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{background:p.accent}}/>
              {p.name.split('—')[0].trim()}
            </button>
          ))}
        </div>

        <div className="flex items-center -space-x-2">
          {TEAM.slice(0,4).map(u => <Avatar key={u.id} user={u} size={30} ring/>)}
          <button className="w-[30px] h-[30px] rounded-full bg-white border-2 border-white dark:border-transparent ring-2 ring-line text-muted hover:text-carbon flex items-center justify-center text-[14px] font-bold">+</button>
        </div>

        <div className="flex-1"/>

        <Button variant="secondary" size="md" onClick={() => { setDraft(filters); setFiltersOpen(true); }}>
          <Ic.Filter width="14" height="14"/> Filtros
          {activeFilterCount > 0 && <span className="ml-1 px-1.5 rounded-full bg-zred text-white text-[10.5px] font-bold nums">{activeFilterCount}</span>}
        </Button>
        <Button variant="primary" size="md" onClick={() => { setNewTaskCol('todo'); setNewTaskOpen(true); }}>
          <Ic.Plus width="15" height="15"/> Nueva tarea
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto scroll-thin pb-4 -mx-8 px-8">
        {columns.map(col => (
          <Column
            key={col.id}
            col={col}
            tasks={filtered.filter(t => t.col === col.id)}
            projects={projects}
            isOver={overCol === col.id}
            draggingId={draggingId}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onCardClick={setOpenTask}
            onCardDragStart={onDragStart}
            onCardDragEnd={onDragEnd}
            onAdd={(colId) => { setNewTaskCol(colId); setNewTaskOpen(true); }}
            onRename={renameColumn}
            onClear={setConfirmClear}
            onSoon={showToast}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
        <div className="flex items-center gap-1.5">
          <kbd className="font-mono bg-white border border-line2 rounded px-1.5 py-0.5 text-[10.5px]">drag</kbd>
          <span>Arrastra cualquier tarjeta entre columnas. Los cambios se sincronizan al instante.</span>
        </div>
        <div>{filtered.length} de {tasks.length} tareas visibles</div>
      </div>

      {openTask && (
        <TaskDetail
          task={tasks.find(t => t.id === openTask.id)}
          projects={projects}
          onClose={() => setOpenTask(null)}
          onUpdate={async (t) => {
            const snapshot = taskListRef.current;
            const previous = snapshot.find(x => x.id === t.id);
            setTasks(prev => prev.map(x => x.id === t.id ? t : x));
            try {
              await updateTask(t.id, t);
              if (previous?.col !== 'done' && t.col === 'done') {
                notifyTaskCompleted(t.title, TEAM[0]?.id ?? '');
              }
            } catch {
              setTasks(snapshot);
              showToast('Error al guardar la tarea');
            }
          }}
          onDelete={async (id) => {
            const snapshot = taskListRef.current;
            setTasks(prev => prev.filter(x => x.id !== id));
            try {
              await deleteTask(id);
            } catch {
              setTasks(snapshot);
              showToast('Error al eliminar la tarea');
            }
          }}
          comments={taskComments[openTask.id] || []}
          onAddComment={onAddComment}
        />
      )}
      <NewTaskModal
        open={newTaskOpen}
        defaultCol={newTaskCol}
        projects={projects}
        onClose={() => setNewTaskOpen(false)}
        onCreate={async (t) => {
          try {
            const created = await createTask(t);
            setTasks(prev => prev.map(x => x.id === t.id ? created : x));
            notifyTaskCreated(created.title, TEAM[0]?.id ?? '');
          } catch {
            setTasks(prev => [...prev, t]);
            showToast('Error al crear la tarea');
          }
        }}
      />
      <FiltersDrawer
        open={filtersOpen}
        context="kanban"
        value={draft}
        onChange={setDraft}
        onApply={() => setFilters(draft)}
        onReset={() => { const empty = { assignees:[], tags:[], priorities:[], due:'all', sort:'recent' }; setDraft(empty); setFilters(empty); }}
        onClose={() => setFiltersOpen(false)}
      />
      <ConfirmDialog
        open={!!confirmClear}
        title="¿Limpiar esta columna?"
        message={confirmClear ? `Se eliminarán ${tasks.filter(t => t.col === confirmClear.id).length} tareas de ${confirmClear.title}. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, limpiar"
        cancelLabel="Cancelar"
        onConfirm={clearColumn}
        onCancel={() => setConfirmClear(null)}
      />
    </div>
  );
}
