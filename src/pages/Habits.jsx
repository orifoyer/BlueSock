import { useState } from 'react';
import { useStore } from '../store.jsx';
import { DAY_NAMES, dateKey, weekDates } from '../dates.js';
import { completionRate, currentStreak, isScheduled } from '../habits.js';
import { AreaSelect, AreaTag, Empty, Field, GoalSelect, Modal, PageHeader } from '../components/ui.jsx';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const blank = () => ({ title: '', cue: '', areaId: '', goalId: '', days: [...ALL_DAYS], log: {} });

export default function Habits() {
  const { state, dispatch } = useStore();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState(null);
  const week = weekDates(new Date(), offset);
  const todayKey = dateKey();

  const save = (draft) => {
    const item = { ...draft, title: draft.title.trim() };
    if (draft.id) dispatch({ type: 'update', collection: 'habits', id: draft.id, patch: item });
    else dispatch({ type: 'add', collection: 'habits', item });
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Habits"
        subtitle="Build routines that move you toward your goals."
        action={<button className="btn primary" onClick={() => setEditing(blank())}>+ New habit</button>}
      />
      {state.habits.length === 0 ? (
        <Empty icon="↻" title="No habits yet" text="Pick one small daily action and check it off each day." action={<button className="btn primary" onClick={() => setEditing(blank())}>Create a habit</button>} />
      ) : (
        <section className="card">
          <div className="row-between week-nav">
            <button className="btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous week">‹ Prev</button>
            <strong>
              {week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </strong>
            <button className="btn" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} aria-label="Next week">Next ›</button>
          </div>
          <div className="habit-table-wrap">
            <table className="habit-table">
              <thead>
                <tr>
                  <th className="left">Habit</th>
                  {week.map((d) => (
                    <th key={dateKey(d)} className={dateKey(d) === todayKey ? 'today' : ''}>
                      {DAY_NAMES[d.getDay()]}<br /><span className="muted small">{d.getDate()}</span>
                    </th>
                  ))}
                  <th>Streak</th>
                  <th>30d</th>
                </tr>
              </thead>
              <tbody>
                {state.habits.map((h) => (
                  <tr key={h.id}>
                    <td className="left">
                      <button className="link" onClick={() => setEditing(structuredClone(h))}>{h.title}</button>
                      <div><AreaTag areaId={h.areaId} /></div>
                    </td>
                    {week.map((d) => {
                      const k = dateKey(d);
                      const future = k > todayKey;
                      const sched = isScheduled(h, d);
                      const done = !!h.log[k];
                      return (
                        <td key={k} className={k === todayKey ? 'today' : ''}>
                          <button
                            className={`cell ${done ? 'on' : ''} ${sched ? '' : 'off'}`}
                            disabled={future}
                            onClick={() => dispatch({ type: 'toggleHabit', id: h.id, date: k })}
                            aria-label={`${h.title} on ${d.toDateString()}: ${done ? 'done' : 'not done'}`}
                            aria-pressed={done}
                          >
                            {done ? '✓' : sched ? '' : '·'}
                          </button>
                        </td>
                      );
                    })}
                    <td><strong>🔥 {currentStreak(h)}</strong></td>
                    <td>{Math.round(completionRate(h) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {editing && (
        <HabitEditor
          draft={editing}
          onSave={save}
          onDelete={editing.id ? () => { if (confirm(`Delete habit “${editing.title}” and its history?`)) { dispatch({ type: 'remove', collection: 'habits', id: editing.id }); setEditing(null); } } : null}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function HabitEditor({ draft: initial, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(initial);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v?.target ? v.target.value : v }));
  const toggleDay = (n) =>
    setDraft((d) => ({ ...d, days: d.days.includes(n) ? d.days.filter((x) => x !== n) : [...d.days, n].sort() }));

  return (
    <Modal
      title={draft.id ? 'Edit habit' : 'New habit'}
      onClose={onClose}
      footer={
        <>
          {onDelete && <button className="btn ghost danger" onClick={onDelete}>Delete</button>}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!draft.title.trim() || draft.days.length === 0} onClick={() => onSave(draft)}>Save habit</button>
        </>
      }
    >
      <Field label="Habit"><input autoFocus value={draft.title} onChange={set('title')} placeholder="e.g. Meditate 10 minutes" /></Field>
      <Field label="Cue / when"><input value={draft.cue} onChange={set('cue')} placeholder="e.g. After morning coffee" /></Field>
      <Field label="Repeat on">
        <div className="day-picker">
          {ALL_DAYS.map((n) => (
            <button key={n} type="button" className={draft.days.includes(n) ? 'on' : ''} aria-pressed={draft.days.includes(n)} onClick={() => toggleDay(n)}>
              {DAY_NAMES[n]}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid-2 tight">
        <Field label="Life area"><AreaSelect value={draft.areaId} onChange={set('areaId')} /></Field>
        <Field label="Supports goal"><GoalSelect value={draft.goalId} onChange={set('goalId')} /></Field>
      </div>
    </Modal>
  );
}
