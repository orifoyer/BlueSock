import { useState } from 'react';
import { useStore } from '../store.jsx';
import { dateKey, daysUntil, formatDate } from '../dates.js';
import { Empty, Field, GoalSelect, Modal, PageHeader } from '../components/ui.jsx';

const PRIORITIES = { high: 'High', medium: 'Medium', low: 'Low' };
const PRI_ORDER = { high: 0, medium: 1, low: 2 };
const blank = () => ({ title: '', notes: '', dueDate: '', priority: 'medium', goalId: '', done: false });

export default function Tasks() {
  const { state, dispatch } = useStore();
  const [view, setView] = useState('open');
  const [quick, setQuick] = useState('');
  const [editing, setEditing] = useState(null);
  const tKey = dateKey();

  const tasks = state.tasks
    .filter((t) => {
      if (view === 'open') return !t.done;
      if (view === 'today') return !t.done && t.dueDate && t.dueDate <= tKey;
      if (view === 'done') return t.done;
      return true;
    })
    .sort((a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.dueDate || '9999').localeCompare(b.dueDate || '9999') ||
      PRI_ORDER[a.priority] - PRI_ORDER[b.priority],
    );

  const addQuick = (e) => {
    e.preventDefault();
    if (!quick.trim()) return;
    dispatch({ type: 'add', collection: 'tasks', item: { ...blank(), title: quick.trim() } });
    setQuick('');
  };
  const save = (draft) => {
    const item = { ...draft, title: draft.title.trim() };
    if (draft.id) dispatch({ type: 'update', collection: 'tasks', id: draft.id, patch: item });
    else dispatch({ type: 'add', collection: 'tasks', item });
    setEditing(null);
  };
  const toggle = (t) =>
    dispatch({ type: 'update', collection: 'tasks', id: t.id, patch: { done: !t.done, completedAt: t.done ? null : new Date().toISOString() } });

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Action steps that turn goals into results."
        action={<button className="btn primary" onClick={() => setEditing(blank())}>+ New task</button>}
      />
      <form className="card quick-add" onSubmit={addQuick}>
        <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Quick add a task and press Enter…" aria-label="Quick add task" />
        <button className="btn primary" type="submit">Add</button>
      </form>
      <div className="toolbar">
        <div className="seg" role="tablist">
          {[['open', 'Open'], ['today', 'Due'], ['done', 'Completed'], ['all', 'All']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
        {view === 'done' && tasks.length > 0 && (
          <button className="btn ghost" onClick={() => confirm('Delete all completed tasks?') && tasks.forEach((t) => dispatch({ type: 'remove', collection: 'tasks', id: t.id }))}>
            Clear completed
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <Empty icon="✓" title="Nothing here" text={view === 'done' ? 'Completed tasks will show up here.' : 'Add a task above to get started.'} />
      ) : (
        <ul className="card task-list">
          {tasks.map((t) => {
            const goal = state.goals.find((g) => g.id === t.goalId);
            const d = daysUntil(t.dueDate);
            return (
              <li key={t.id} className={t.done ? 'is-done' : ''}>
                <input type="checkbox" checked={t.done} onChange={() => toggle(t)} aria-label={`Complete ${t.title}`} />
                <button className="task-main" onClick={() => setEditing(structuredClone(t))}>
                  <span className="task-title">{t.title}</span>
                  <span className="task-meta">
                    <span className={`pri pri-${t.priority}`}>{PRIORITIES[t.priority]}</span>
                    {t.dueDate && (
                      <span className={!t.done && d < 0 ? 'danger' : !t.done && d === 0 ? 'warn' : ''}>
                        {d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : formatDate(t.dueDate, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    {goal && <span>◆ {goal.title}</span>}
                  </span>
                </button>
                <button className="icon-btn" aria-label={`Delete ${t.title}`} onClick={() => dispatch({ type: 'remove', collection: 'tasks', id: t.id })}>×</button>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <TaskEditor draft={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function TaskEditor({ draft: initial, onSave, onClose }) {
  const [draft, setDraft] = useState(initial);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v?.target ? v.target.value : v }));
  return (
    <Modal
      title={draft.id ? 'Edit task' : 'New task'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!draft.title.trim()} onClick={() => onSave(draft)}>Save task</button>
        </>
      }
    >
      <Field label="Task"><input autoFocus value={draft.title} onChange={set('title')} placeholder="What needs doing?" /></Field>
      <Field label="Notes"><textarea rows={3} value={draft.notes} onChange={set('notes')} /></Field>
      <div className="grid-2 tight">
        <Field label="Due date"><input type="date" value={draft.dueDate} onChange={set('dueDate')} /></Field>
        <Field label="Priority">
          <select value={draft.priority} onChange={set('priority')}>
            {Object.entries(PRIORITIES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Goal"><GoalSelect value={draft.goalId} onChange={set('goalId')} /></Field>
    </Modal>
  );
}
