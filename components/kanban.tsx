'use client'

import { useState, useEffect, useMemo, useRef, useReducer } from 'react'
import { Ic } from '@/components/icons'
import { Card, Badge, Button, IconButton, Avatar, AvatarStack, Input, Drawer, Modal, ProgressBar, Tag } from './ui'
import { CustomDatePicker as DatePicker, CustomSelect } from './controls'
import { COLUMNS, TAG_STYLES, PRIORITY, STATUS_LABEL, formatDate, formatMoney, daysUntil } from '@/lib/constants'
import { useCurrentProfile } from '@/lib/supabase/useCurrentProfile'
import { ConfirmDialog, FiltersDrawer } from './modals'
import { createTask, updateTask, deleteTask, moveTask } from '@/lib/supabase/queries'
import { notifyTaskCompleted, notifyTaskCreated } from '@/lib/supabase/notify'

const PROG_COLOR: Record<string, string> = {
  todo:     '#D1D1CE',
  progress: '#E0B84A',
  done:     '#3CB371',
}
const COL_COLORS: Record<string, string> = {
  todo: '#6B6B6B', progress: '#3A47B5', done: '#1E6B3C',
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
      <div className="flex items-center [&>*+*]:-ml-1.5">
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
      <span className={`size-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

function TaskCard({ task, projects, profiles = [], columns = [], onClick, onDragStart, onDragEnd, dragging, onMoveToCol }: any) {
  const project = projects.find(p => p.id === task.project);
  const team = task.assignee.flatMap(id => { const u = profiles.find(m => m.id === id); return u ? [u] : []; });
  const days = daysUntil(task.due);
  const overdue = task.due && days < 0 && task.col !== 'done';
  const soon = task.due && days >= 0 && days <= 3 && task.col !== 'done';
  const subDone = task.subtasks.filter(s => s.d).length;
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <div className="relative">
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className={`group bg-white border border-line2 rounded-md p-3.5 cursor-grab active:cursor-grabbing hover:border-zred/30 hover:shadow-soft transition-all text-left w-full ${dragging ? 'dragging' : ''}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-1.5 rounded-full shrink-0" style={{ background: project?.accent || '#1D1D1B' }} />
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
          {/* Mobile move button */}
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setMoveOpen(v => !v); }}
            className="md:hidden flex items-center gap-0.5 px-2 py-1 rounded bg-soft text-muted text-[10.5px] font-semibold hover:bg-line2 active:scale-95 transition-all"
            aria-label="Mover tarea"
          >
            ↕ Mover
          </button>
        </div>
      </div>
    </button>

    {/* Mobile column picker */}
    {moveOpen && (
      <div className="md:hidden absolute right-2 bottom-full mb-1 z-20 bg-white border border-line2 rounded-lg shadow-pop min-w-[160px] overflow-hidden">
        {columns.filter(c => c.id !== task.col).map(c => (
          <button key={c.id} type="button"
            onClick={(e) => { e.stopPropagation(); onMoveToCol?.(task, c.id); setMoveOpen(false); }}
            className="flex items-center gap-2.5 px-4 h-10 text-[12.5px] font-medium text-carbon hover:bg-soft w-full text-left transition-colors">
            <span className="size-2 rounded-full shrink-0" style={{ background: COL_COLORS[c.id] || '#6B6B6B' }} />
            {c.title}
          </button>
        ))}
      </div>
    )}
    </div>
  );
}

function Column({ col, tasks, projects, profiles = [], columns = [], onDrop, onDragOver, onDragLeave, isOver, onCardClick, onCardDragStart, onCardDragEnd, draggingId, onAdd, onRename, onClear, onSoon, onMoveCard }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const menuRef = useRef(null);
  const menuOpenRef = useRef(false);

  useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);

  useEffect(() => {
    function onDown(e) {
      if (!menuOpenRef.current) return;
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
  }, []);

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
      style={{ maxHeight: 'calc(100dvh - 180px)' }}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{background: COL_COLORS[col.id]}} />
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
              aria-label="Renombrar columna"
            />
          ) : (
            <h3 className="text-[13px] font-bold tracking-tight">{col.title}</h3>
          )}
          <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full bg-white border border-line2 text-[11px] font-bold nums">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => onAdd(col.id)} className="size-7 rounded hover:bg-white inline-flex items-center justify-center text-muted hover:text-carbon" aria-label="Añadir tarea">
            <Ic.Plus width="14" height="14"/>
          </button>
          <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen(open => !open)} className="size-7 rounded hover:bg-white inline-flex items-center justify-center text-muted" aria-label="Menú de columna">
              <Ic.Dots width="14" height="14"/>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-md border border-line2 bg-white shadow-pop p-1 pop-in">
                <button type="button" onClick={() => { setMenuOpen(false); setRenaming(true); setTitleDraft(col.title); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Edit width="13" height="13" className="text-muted"/> Renombrar columna
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); onClear(col); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
                  <Ic.Trash width="13" height="13" className="text-muted"/> Limpiar tareas
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); onSoon('Archivar columna estará disponible próximamente.'); }} className="w-full flex items-center gap-2 px-3 h-8 rounded text-[12.5px] hover:bg-soft text-left">
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
            profiles={profiles}
            columns={columns}
            dragging={draggingId === t.id}
            onClick={onCardClick}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            onMoveToCol={onMoveCard}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8 px-3 border-2 border-dashed border-line rounded-md text-muted">
            <div className="size-8 rounded-full bg-white border border-line2 inline-flex items-center justify-center mb-2">
              <Ic.Plus width="14" height="14"/>
            </div>
            <div className="text-[11.5px]">Suelta tarjetas aquí</div>
          </div>
        )}
      </div>

      <button type="button" onClick={() => onAdd(col.id)} className="text-[12px] font-semibold text-muted hover:text-zred text-left px-1 py-1.5">
        + Añadir tarea
      </button>
    </div>
  );
}

function taskDetailReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, edit: { ...state.edit, [action.key]: action.value } };
    case 'SET_SAVED':
      return { ...state, saved: action.value };
    case 'SET_NEW_SUBTASK':
      return { ...state, newSubtask: action.value };
    case 'SET_NEW_COMMENT':
      return { ...state, newComment: action.value };
    case 'SET_EDITING_SUB':
      return { ...state, editingSub: action.value };
    case 'TOGGLE_SUB':
      const subs = state.edit.subtasks.map((s: any, i: number) => i === action.idx ? { ...s, d: !s.d } : s);
      return { ...state, edit: { ...state.edit, subtasks: subs } };
    case 'ADD_SUBTASK':
      return {
        ...state,
        edit: { ...state.edit, subtasks: [...state.edit.subtasks, { t: action.text.trim(), d: false }] },
        newSubtask: '',
        editingSub: false,
      };
    default:
      return state;
  }
}

function TaskDetail({ task, projects, profiles = [], onClose, onUpdate, onDelete, comments, onAddComment }: any) {
  const currentUser = useCurrentProfile()
  const [state, dispatch] = useReducer(taskDetailReducer, {
    edit: { ...(task || {}), description: task?.description || '' },
    saved: false,
    newSubtask: '',
    newComment: '',
    editingSub: false,
  });
  if (!task) return null;
  const project = projects.find(p => p.id === task.project);

  function save() {
    const prog = state.edit.progress || {};
    const allDone = state.edit.assignee?.length > 0 && state.edit.assignee.every((id: string) => prog[id] === 'done');
    onUpdate({ ...state.edit, comments: task.comments, ...(allDone ? { col: 'done' } : {}) });
    dispatch({ type: 'SET_SAVED', value: true });
    setTimeout(() => dispatch({ type: 'SET_SAVED', value: false }), 1500);
  }

  function toggleSub(idx: number) {
    dispatch({ type: 'TOGGLE_SUB', idx });
  }

  function addSubtask() {
    if (!state.newSubtask.trim()) return;
    dispatch({ type: 'ADD_SUBTASK', text: state.newSubtask });
  }

  function handleCommentSubmit(e: any) {
    if (e) e.preventDefault();
    if (!state.newComment.trim()) return;
    onAddComment(task.id, state.newComment.trim());
    dispatch({ type: 'SET_NEW_COMMENT', value: '' });
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
              {state.saved ? 'Guardado ✓' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      }>
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="size-2 rounded-full" style={{background: project?.accent || '#1D1D1B'}}/>
          <span className="text-[12px] font-semibold text-muted">{project?.name}</span>
          <Tag tag={task.tag} />
        </div>

        <input value={state.edit.title} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'title', value: e.target.value })}
          aria-label="Título de la tarea"
          className="w-full text-[20px] font-bold tracking-tight leading-snug bg-transparent border-b border-transparent hover:border-line focus:border-zred outline-none transition-colors" />

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Estado</div>
            <select value={state.edit.col} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'col', value: e.target.value })}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Prioridad</div>
            <select value={state.edit.priority} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'priority', value: e.target.value })}
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white">
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Vencimiento</div>
            <input type="date" value={state.edit.due || ''} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'due', value: e.target.value || null })}
              aria-label="Fecha de vencimiento"
              className="w-full h-9 px-2.5 rounded-md border border-line text-[13px] bg-white" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Asignados</div>
            <div className="flex flex-wrap gap-1">
              {profiles.map(u => {
                const on = state.edit.assignee?.includes(u.id);
                return (
                  <button key={u.id} type="button" onClick={() => dispatch({ type: 'SET_FIELD', key: 'assignee', value: on ? state.edit.assignee.filter((x: string) => x !== u.id) : [...(state.edit.assignee || []), u.id] })}
                    className={`size-7 rounded-full text-[10px] font-bold text-white transition-all ${on ? 'ring-2 ring-offset-1 ring-zred scale-110' : 'opacity-50 hover:opacity-100'}`}
                    style={{background: u.color}} title={u.name}>
                    {u.initials}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {state.edit.assignee?.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Progreso por persona</div>
            <div className="space-y-2">
              {state.edit.assignee.map((uid: string) => {
                const u = profiles.find(m => m.id === uid);
                if (!u) return null;
                const status = state.edit.progress?.[uid] || 'todo';
                return (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size={28} />
                    <span className="text-[13px] font-medium flex-1 min-w-0 truncate">{u.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {PROG_STATUS.map(s => (
                        <button type="button" key={s.value} onClick={() => dispatch({ type: 'SET_FIELD', key: 'progress', value: { ...(state.edit.progress || {}), [uid]: s.value } })}
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
            {!state.editingSub && (
              <button type="button" onClick={() => dispatch({ type: 'SET_EDITING_SUB', value: true })} className="text-[12px] font-semibold text-zred hover:underline">+ Añadir</button>
            )}
          </div>
          {state.editingSub && (
            <div className="flex items-center gap-2 mb-2">
              <input value={state.newSubtask} onChange={(e) => dispatch({ type: 'SET_NEW_SUBTASK', value: e.target.value })}
                onKeyDown={(e) => (e as any).key === 'Enter' && addSubtask()}
                placeholder="Nombre de la subtarea..."
                aria-label="Nueva subtarea"
                className="flex-1 h-9 px-3 rounded-md border border-line text-[13px] bg-white outline-none focus:border-zred" />
              <button type="button" onClick={addSubtask} className="size-9 rounded-md bg-zred text-white flex items-center justify-center hover:bg-zred2 transition-colors" aria-label="Confirmar subtarea">
                <Ic.Check width="14" height="14"/>
              </button>
              <button type="button" onClick={() => { dispatch({ type: 'SET_EDITING_SUB', value: false }); dispatch({ type: 'SET_NEW_SUBTASK', value: '' }); }} className="size-9 rounded-md border border-line flex items-center justify-center text-muted hover:text-carbon" aria-label="Cancelar">
                <Ic.X width="14" height="14"/>
              </button>
            </div>
          )}
          {state.edit.subtasks.length === 0 ? (
            <div className="text-[13px] text-muted">Sin subtareas aún.</div>
          ) : (
            <div className="space-y-1">
              {state.edit.subtasks.map((s: any, i: number) => (
                <button type="button" key={`${s.t}-${i}`} onClick={() => toggleSub(i)} className="w-full flex items-center gap-3 p-2 rounded hover:bg-soft text-left">
                  <span className={`size-[18px] rounded border flex items-center justify-center transition-colors ${s.d ? 'bg-zred border-zred text-white' : 'border-line bg-white'}`}>
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
          <textarea value={state.edit.description || ''} onChange={(e) => dispatch({ type: 'SET_FIELD', key: 'description', value: e.target.value })}
            placeholder="Especifica los criterios de aceptación, mockups relevantes y dependencias técnicas."
            aria-label="Descripción de la tarea"
            className="w-full rounded-md border border-line2 p-3 text-[13.5px] text-carbon leading-relaxed bg-transparent resize-none min-h-[100px]" />
        </div>

        <div>
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Comentarios</div>
          <div className="space-y-3 text-[13px] mb-3">
            {comments.map(c => {
              const user = profiles.find(u => u.id === c.userId);
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
            <Avatar user={currentUser} size={28}/>
            <input value={state.newComment} onChange={(e) => dispatch({ type: 'SET_NEW_COMMENT', value: e.target.value })}
              placeholder="Escribe un comentario..."
              aria-label="Nuevo comentario"
              className="flex-1 h-10 px-3.5 rounded-full bg-soft border border-transparent text-[13px] outline-none focus:border-zred/30" />
            <button type="submit" disabled={!state.newComment.trim()}
              className="size-10 rounded-full bg-zred text-white flex items-center justify-center disabled:opacity-50 hover:bg-zred2 transition-colors" aria-label="Enviar comentario">
              <Ic.Arrow width="14" height="14"/>
            </button>
          </form>
        </div>
      </div>
    </Drawer>
  );
}

function NewTaskModal({ open, defaultCol, projects, profiles = [], onClose, onCreate }: any) {
  const [form, setForm] = useState({ title:'', project: projects[0]?.id, priority:'med', col: defaultCol || 'todo', tag:'feature', due:'', assignee: [] as string[] });

  function toggleAssignee(id: string) {
    setForm(f => ({ ...f, assignee: f.assignee.includes(id) ? f.assignee.filter(x => x !== id) : [...f.assignee, id] }));
  }

  function submit() {
    if (!form.title.trim()) return;
    onCreate({
      col: form.col, project: form.project || null, title: form.title.trim(),
      tag: form.tag, priority: form.priority, due: form.due || null,
      assignee: form.assignee,
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
            {profiles.map(u => {
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

const KANBAN_INIT = {
  search: '',
  projectFilter: 'all',
  draggingId: null,
  overCol: null,
  openTask: null,
  newTaskOpen: false,
  newTaskCol: 'todo',
  openCount: 0,
  filtersOpen: false,
  filters: { assignees: [] as string[], tags: [] as string[], priorities: [] as string[], due: 'all', sort: 'recent' as string },
  draft: { assignees: [] as string[], tags: [] as string[], priorities: [] as string[], due: 'all', sort: 'recent' as string },
  taskComments: {} as Record<string, any[]>,
  columnTitles: null as Record<string, string> | null,
  confirmClear: null,
  toast: '',
};

function kanbanReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_SEARCH': return { ...state, search: action.value };
    case 'SET_PROJECT_FILTER': return { ...state, projectFilter: action.value };
    case 'SET_DRAGGING': return { ...state, draggingId: action.value };
    case 'SET_OVER_COL': return { ...state, overCol: action.value };
    case 'OPEN_TASK': return { ...state, openTask: action.value };
    case 'CLOSE_TASK': return { ...state, openTask: null };
    case 'OPEN_NEW_TASK': return { ...state, newTaskOpen: true, newTaskCol: action.col, openCount: state.openCount + 1 };
    case 'CLOSE_NEW_TASK': return { ...state, newTaskOpen: false };
    case 'SET_FILTERS_OPEN': return { ...state, filtersOpen: action.value };
    case 'SET_FILTERS': return { ...state, filters: action.value };
    case 'SET_DRAFT': return { ...state, draft: action.value };
    case 'ADD_COMMENT':
      const comment = { id: 'c' + Date.now(), text: action.text, userId: action.userId, timestamp: new Date().toISOString() };
      return { ...state, taskComments: { ...state.taskComments, [action.taskId]: [...(state.taskComments[action.taskId] || []), comment] } };
    case 'RENAME_COLUMN': return { ...state, columnTitles: { ...state.columnTitles, [action.id]: action.title } };
    case 'SET_CONFIRM_CLEAR': return { ...state, confirmClear: action.value };
    case 'SET_TOAST': return { ...state, toast: action.value };
    default: return state;
  }
}

export default function Kanban({ tasks, setTasks, projects, profiles = [] }: any) {
  const currentUser = useCurrentProfile()
  const [state, dispatch] = useReducer(kanbanReducer, null, () => ({
    ...KANBAN_INIT,
    columnTitles: Object.fromEntries(COLUMNS.map(c => [c.id, c.title])),
  }));
  const taskListRef = useRef(tasks);
  useEffect(() => { taskListRef.current = tasks; }, [tasks]);
  const toastRef = useRef<number | undefined>(undefined);

  const activeFilterCount = state.filters.assignees.length + state.filters.tags.length + state.filters.priorities.length + (state.filters.due !== 'all' ? 1 : 0);

  const filtered = useMemo(() => {
    const result = tasks.filter(t => {
      if (state.projectFilter !== 'all' && t.project !== state.projectFilter) return false;
      if (state.search && !t.title.toLowerCase().includes(state.search.toLowerCase())) return false;
      if (state.filters.assignees.length > 0 && !t.assignee.some(a => state.filters.assignees.includes(a))) return false;
      if (state.filters.tags.length > 0 && !state.filters.tags.includes(t.tag)) return false;
      if (state.filters.priorities.length > 0 && !state.filters.priorities.includes(t.priority)) return false;
      if (state.filters.due !== 'all') {
        const days = t.due ? daysUntil(t.due) : null;
        if (state.filters.due === 'none' && t.due) return false;
        if (state.filters.due === 'overdue' && (!t.due || days >= 0 || t.col === 'done')) return false;
        if (state.filters.due === 'today' && days !== 0) return false;
        if (state.filters.due === 'week' && (days === null || days < 0 || days > 7)) return false;
      }
      return true;
    });
    if (state.filters.sort === 'due') {
      result.sort((a, b) => (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99'));
    } else if (state.filters.sort === 'priority') {
      const order = { high: 0, med: 1, low: 2 };
      result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
    } else if (state.filters.sort === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [tasks, state.search, state.projectFilter, state.filters]);

  function onDragStart(e: any, task: any) {
    dispatch({ type: 'SET_DRAGGING', value: task.id });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  }
  function onDragEnd() { dispatch({ type: 'SET_DRAGGING', value: null }); dispatch({ type: 'SET_OVER_COL', value: null }); }
  function onDragOver(e: any, colId: string) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; dispatch({ type: 'SET_OVER_COL', value: colId }); }
  function onDragLeave() { dispatch({ type: 'SET_OVER_COL', value: null }); }
  function onDrop(e: any, colId: string) {
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
    dispatch({ type: 'SET_DRAGGING', value: null }); dispatch({ type: 'SET_OVER_COL', value: null });
    const progress = colId === 'done'
      ? Object.fromEntries(task.assignee.map(uid => [uid, 'done' as const]))
      : undefined;
    moveTask(id, colId, progress)
      .then(() => {
        if (task.col !== 'done' && colId === 'done') {
          notifyTaskCompleted(task.title, currentUser?.id ?? '');
        }
      })
      .catch(() => {
        setTasks(snapshot);
        showToast('Error al mover la tarea');
      });
  }

  function onMoveCard(task: any, colId: string) {
    const snapshot = taskListRef.current;
    setTasks(prev => prev.map(t => {
      if (t.id !== task.id) return t;
      if (colId === 'done') {
        const prog = { ...t.progress };
        t.assignee.forEach(uid => { prog[uid] = 'done'; });
        return { ...t, col: colId, progress: prog };
      }
      return { ...t, col: colId };
    }));
    const progress = colId === 'done'
      ? Object.fromEntries(task.assignee.map(uid => [uid, 'done' as const]))
      : undefined;
    moveTask(task.id, colId, progress)
      .then(() => {
        if (task.col !== 'done' && colId === 'done') {
          notifyTaskCompleted(task.title, currentUser?.id ?? '');
        }
      })
      .catch(() => {
        setTasks(snapshot);
        showToast('Error al mover la tarea');
      });
  }

  function onAddComment(taskId: string, text: string) {
    dispatch({ type: 'ADD_COMMENT', taskId, text, userId: currentUser?.id ?? '' });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: (t.comments || 0) + 1 } : t));
  }
  function renameColumn(id: string, title: string) {
    dispatch({ type: 'RENAME_COLUMN', id, title });
  }
  function showToast(message: string) {
    dispatch({ type: 'SET_TOAST', value: message });
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => dispatch({ type: 'SET_TOAST', value: '' }), 2200);
  }
  async function clearColumn() {
    const target = state.confirmClear;
    dispatch({ type: 'SET_CONFIRM_CLEAR', value: null });
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
  const columns = COLUMNS.map(col => ({ ...col, title: state.columnTitles[col.id] || col.title }));

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col" style={{minHeight:'calc(100vh - 72px)'}}>
      {state.toast && (
        <div className="fixed right-6 bottom-6 z-[80] rounded-md bg-carbon text-white shadow-pop px-4 py-3 text-[13px] font-semibold pop-in">
          {state.toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-5">
        <div className="flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-line w-full max-w-[320px]">
          <Ic.Search width="15" height="15" className="text-muted"/>
          <input value={state.search} onChange={(e)=>dispatch({ type: 'SET_SEARCH', value: (e.target as HTMLInputElement).value })} placeholder="Buscar tarea..." aria-label="Buscar tarea" className="bg-transparent outline-none text-[13.5px] flex-1"/>
        </div>

        <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1 overflow-x-auto no-scrollbar max-w-[calc(100vw-6rem)]">
          <button type="button" onClick={()=>dispatch({ type: 'SET_PROJECT_FILTER', value: 'all' })} className={`px-3 h-8 rounded-full text-[12.5px] font-semibold ${state.projectFilter==='all'?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>Todos</button>
          {projects.slice(0,4).map(p => (
            <button type="button" key={p.id} onClick={()=>dispatch({ type: 'SET_PROJECT_FILTER', value: p.id })}
              className={`px-3 h-8 rounded-full text-[12.5px] font-semibold flex items-center gap-1.5 ${state.projectFilter===p.id?'bg-carbon text-white':'text-muted hover:text-carbon'}`}>
              <span className="size-1.5 rounded-full" style={{background:p.accent}}/>
              {p.name.split('—')[0].trim()}
            </button>
          ))}
        </div>

        <div className="flex items-center [&>*+*]:-ml-2">
          {profiles.slice(0,4).map(u => <Avatar key={u.id} user={u} size={30} ring/>)}
          <button type="button" className="size-[30px] rounded-full bg-white border-2 border-white dark:border-transparent ring-2 ring-line text-muted hover:text-carbon flex items-center justify-center text-[14px] font-bold" aria-label="Añadir miembro">+</button>
        </div>

        <div className="hidden md:flex flex-1"/>

        <Button variant="secondary" size="md" onClick={() => { dispatch({ type: 'SET_DRAFT', value: state.filters }); dispatch({ type: 'SET_FILTERS_OPEN', value: true }); }}>
          <Ic.Filter width="14" height="14"/> Filtros
          {activeFilterCount > 0 && <span className="ml-1 px-1.5 rounded-full bg-zred text-white text-[10.5px] font-bold nums">{activeFilterCount}</span>}
        </Button>
        <Button variant="primary" size="md" onClick={() => dispatch({ type: 'OPEN_NEW_TASK', col: 'todo' })}>
          <Ic.Plus width="15" height="15"/> Nueva tarea
        </Button>
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-thin pb-4 -mx-4 md:-mx-8 px-4 md:px-8">
        {columns.map(col => (
          <Column
            key={col.id}
            col={col}
            columns={columns}
            tasks={filtered.filter(t => t.col === col.id)}
            projects={projects}
            profiles={profiles}
            isOver={state.overCol === col.id}
            draggingId={state.draggingId}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onCardClick={(task: any) => dispatch({ type: 'OPEN_TASK', value: task })}
            onCardDragStart={onDragStart}
            onCardDragEnd={onDragEnd}
            onMoveCard={onMoveCard}
            onAdd={(colId: string) => dispatch({ type: 'OPEN_NEW_TASK', col: colId })}
            onRename={renameColumn}
            onClear={(col: any) => dispatch({ type: 'SET_CONFIRM_CLEAR', value: col })}
            onSoon={showToast}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
        <div className="flex items-center gap-1.5">
          <span className="hidden md:inline-flex items-center gap-1.5">
            <kbd className="font-mono bg-white border border-line2 rounded px-1.5 py-0.5 text-[10.5px]">drag</kbd>
            Arrastra entre columnas. Los cambios se sincronizan al instante.
          </span>
          <span className="md:hidden">Toca ↕ Mover en cada tarjeta para cambiar columna.</span>
        </div>
        <div>{filtered.length} de {tasks.length} tareas visibles</div>
      </div>

      {state.openTask && (
        <TaskDetail key={state.openTask.id}
          task={tasks.find(t => t.id === state.openTask.id)}
          projects={projects}
          profiles={profiles}
          onClose={() => dispatch({ type: 'CLOSE_TASK' })}
          onUpdate={async (t) => {
            const snapshot = taskListRef.current;
            const previous = snapshot.find(x => x.id === t.id);
            setTasks(prev => prev.map(x => x.id === t.id ? t : x));
            try {
              await updateTask(t.id, t);
              if (previous?.col !== 'done' && t.col === 'done') {
                notifyTaskCompleted(t.title, currentUser?.id ?? '');
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
          comments={state.taskComments[state.openTask.id] || []}
          onAddComment={onAddComment}
        />
      )}
      <NewTaskModal
        key={state.openCount}
        open={state.newTaskOpen}
        defaultCol={state.newTaskCol}
        projects={projects}
        profiles={profiles}
        onClose={() => dispatch({ type: 'CLOSE_NEW_TASK' })}
        onCreate={async (t) => {
          try {
            const created = await createTask(t);
            setTasks(prev => [created, ...prev]);
            notifyTaskCreated(created.title, currentUser?.id ?? '');
          } catch {
            setTasks(prev => [...prev, t]);
            showToast('Error al crear la tarea');
          }
        }}
      />
      <FiltersDrawer
        open={state.filtersOpen}
        context="kanban"
        value={state.draft}
        profiles={profiles}
        onChange={(v: any) => dispatch({ type: 'SET_DRAFT', value: v })}
        onApply={() => dispatch({ type: 'SET_FILTERS', value: state.draft })}
        onReset={() => { const empty = { assignees:[], tags:[], priorities:[], due:'all', sort:'recent' }; dispatch({ type: 'SET_DRAFT', value: empty }); dispatch({ type: 'SET_FILTERS', value: empty }); }}
        onClose={() => dispatch({ type: 'SET_FILTERS_OPEN', value: false })}
      />
      <ConfirmDialog
        open={!!state.confirmClear}
        title="¿Limpiar esta columna?"
        message={state.confirmClear ? `Se eliminarán ${tasks.filter(t => t.col === state.confirmClear.id).length} tareas de ${state.confirmClear.title}. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Sí, limpiar"
        cancelLabel="Cancelar"
        onConfirm={clearColumn}
        onCancel={() => dispatch({ type: 'SET_CONFIRM_CLEAR', value: null })}
      />
    </div>
  );
}