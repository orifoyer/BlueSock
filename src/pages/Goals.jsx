import { useState } from 'react';
import { useStore, goalProgress, uid } from '../store.jsx';
import { daysUntil, formatDate } from '../dates.js';
import { AreaSelect, AreaTag, Empty, Field, Modal, PageHeader, Progress } from '../components/ui.jsx';

const blank = () => ({ title: '', description: '', why: '', areaId: '', targetDate: '', milestones: [], status: 'active' });

export default function Goals() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(null); // goal draft or null
  const [filter, setFilter] = useState('active');
  const [area, setArea] = useState('');

  const goals = state.goals
    .filter((g) => (filter === 'all' ? true : filter === 'completed' ? g.status === 'completed' : g.status !== 'completed'))
    .filter((g) => !area || g.areaId === area)
    .sort((a, b) => (a.targetDate || '9999').localeCompare(b.targetDate || '9999'));

  const save = (draft) => {
    const item = { ...draft, title: draft.title.trim(), milestones: draft.milestones.filter((m) => m.title.trim()) };
    if (draft.id) dispatch({ type: 'update', collection: 'goals', id: draft.id, patch: item });
    else dispatch({ type: 'add', collection: 'goals', item });
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Goals"
        subtitle="Define what you want to achieve and break it into milestones."
        action={<button className="btn primary" onClick={() => setEditing(blank())}>+ New goal</button>}
      />
      <div className="toolbar">
        <div className="seg" role="tablist">
          {['active', 'completed', 'all'].map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <AreaSelect value={area} onChange={setArea} emptyLabel="All life areas" />
      </div>

      {goals.length === 0 ? (
        <Empty icon="◆" title="No goals here" text="Goals give your habits and tasks a purpose." action={<button className="btn primary" onClick={() => setEditing(blank())}>Create a goal</button>} />
      ) : (
        <div className="cards">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={() => setEditing(structuredClone(g))} />
          ))}
        </div>
      )}

      {editing && <GoalEditor draft={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function GoalCard({ goal, onEdit }) {
  const { state, dispatch } = useStore();
  const p = goalProgress(goal);
  const color = state.areas.find((a) => a.id === goal.areaId)?.color;
  const d = daysUntil(goal.targetDate);
  const linkedTasks = state.tasks.filter((t) => t.goalId === goal.id);
  const linkedHabits = state.habits.filter((h) => h.goalId === goal.id);
  const done = goal.status === 'completed';

  return (
    <article className={`card goal ${done ? 'is-done' : ''}`} style={{ '--accent': color || 'var(--primary)' }}>
      <div className="row-between">
        <AreaTag areaId={goal.areaId} />
        <span className="muted small">
          {goal.targetDate ? `${formatDate(goal.targetDate)}${!done && d !== null ? ` · ${d >= 0 ? `${d}d left` : 'past due'}` : ''}` : 'No target date'}
        </span>
      </div>
      <h3>{done && '🏆 '}{goal.title}</h3>
      {goal.description && <p>{goal.description}</p>}
      {goal.why && <p className="why"><strong>Why:</strong> {goal.why}</p>}
      <div className="row-between small"><span>Progress</span><span>{p}%</span></div>
      <Progress value={p} color={color} />
      {goal.milestones.length > 0 && (
        <ul className="check-list compact">
          {goal.milestones.map((m) => (
            <li key={m.id}>
              <label>
                <input type="checkbox" checked={m.done} onChange={() => dispatch({ type: 'toggleMilestone', goalId: goal.id, milestoneId: m.id })} />
                <span className={m.done ? 'done' : ''}>{m.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {(linkedTasks.length > 0 || linkedHabits.length > 0) && (
        <p className="muted small">
          {linkedHabits.length} habit{linkedHabits.length !== 1 && 's'} · {linkedTasks.filter((t) => t.done).length}/{linkedTasks.length} tasks done
        </p>
      )}
      <div className="card-actions">
        <button className="btn" onClick={onEdit}>Edit</button>
        <button className="btn" onClick={() => dispatch({ type: 'update', collection: 'goals', id: goal.id, patch: { status: done ? 'active' : 'completed', completedAt: done ? null : new Date().toISOString() } })}>
          {done ? 'Reopen' : 'Mark achieved'}
        </button>
        <button className="btn ghost danger" onClick={() => confirm(`Delete goal “${goal.title}”?`) && dispatch({ type: 'remove', collection: 'goals', id: goal.id })}>Delete</button>
      </div>
    </article>
  );
}

function GoalEditor({ draft: initial, onSave, onClose }) {
  const [draft, setDraft] = useState(initial);
  const [ms, setMs] = useState('');
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v?.target ? v.target.value : v }));
  const addMs = () => {
    if (!ms.trim()) return;
    setDraft((d) => ({ ...d, milestones: [...d.milestones, { id: uid(), title: ms.trim(), done: false }] }));
    setMs('');
  };

  return (
    <Modal
      title={draft.id ? 'Edit goal' : 'New goal'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!draft.title.trim()} onClick={() => onSave(draft)}>Save goal</button>
        </>
      }
    >
      <Field label="Goal"><input autoFocus value={draft.title} onChange={set('title')} placeholder="e.g. Run a half marathon" /></Field>
      <Field label="Description"><textarea rows={2} value={draft.description} onChange={set('description')} placeholder="What does success look like?" /></Field>
      <Field label="Why it matters"><textarea rows={2} value={draft.why} onChange={set('why')} placeholder="Your motivation" /></Field>
      <div className="grid-2 tight">
        <Field label="Life area"><AreaSelect value={draft.areaId} onChange={set('areaId')} /></Field>
        <Field label="Target date"><input type="date" value={draft.targetDate} onChange={set('targetDate')} /></Field>
      </div>
      <Field label="Milestones">
        <div className="inline-add">
          <input value={ms} onChange={(e) => setMs(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMs())} placeholder="Add a milestone and press Enter" />
          <button type="button" className="btn" onClick={addMs}>Add</button>
        </div>
      </Field>
      <ul className="ms-edit">
        {draft.milestones.map((m, i) => (
          <li key={m.id}>
            <input value={m.title} onChange={(e) => setDraft((d) => ({ ...d, milestones: d.milestones.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} />
            <button className="icon-btn" aria-label="Remove milestone" onClick={() => setDraft((d) => ({ ...d, milestones: d.milestones.filter((_, j) => j !== i) }))}>×</button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
