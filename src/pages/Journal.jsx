import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { dateKey, formatDate } from '../dates.js';
import { Empty, Field, Modal, PageHeader } from '../components/ui.jsx';

export const MOODS = [
  { v: 1, e: '😞', l: 'Rough' },
  { v: 2, e: '😕', l: 'Meh' },
  { v: 3, e: '😐', l: 'Okay' },
  { v: 4, e: '🙂', l: 'Good' },
  { v: 5, e: '😄', l: 'Great' },
];

const PROMPTS = [
  'What went well today?',
  'What did I learn?',
  'What would make tomorrow great?',
  'What am I proud of this week?',
  'What is one thing I can improve?',
];

const blank = () => ({ date: dateKey(), title: '', body: '', gratitude: ['', '', ''], mood: 4 });

export default function Journal() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');

  const entries = useMemo(
    () =>
      state.journal
        .filter((j) => {
          if (!q.trim()) return true;
          const s = q.toLowerCase();
          return [j.title, j.body, ...(j.gratitude || [])].some((x) => x?.toLowerCase().includes(s));
        })
        .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '')),
    [state.journal, q],
  );

  const avgMood = state.journal.length
    ? (state.journal.reduce((s, j) => s + (j.mood || 0), 0) / state.journal.length).toFixed(1)
    : '—';

  const save = (draft) => {
    const item = { ...draft, gratitude: draft.gratitude.map((g) => g.trim()).filter(Boolean) };
    if (draft.id) dispatch({ type: 'update', collection: 'journal', id: draft.id, patch: item });
    else dispatch({ type: 'add', collection: 'journal', item });
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Journal"
        subtitle={`Reflect, track your mood and practice gratitude. Average mood: ${avgMood}`}
        action={<button className="btn primary" onClick={() => setEditing(blank())}>+ New entry</button>}
      />
      {state.journal.length > 0 && (
        <div className="toolbar">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries…" aria-label="Search journal" />
        </div>
      )}
      {entries.length === 0 ? (
        <Empty icon="✎" title={q ? 'No matching entries' : 'Your journal is empty'} text="A few lines a day builds self-awareness." action={!q && <button className="btn primary" onClick={() => setEditing(blank())}>Write today’s entry</button>} />
      ) : (
        <div className="journal-list">
          {entries.map((j) => {
            const mood = MOODS.find((m) => m.v === j.mood);
            return (
              <article key={j.id} className="card entry">
                <div className="row-between">
                  <span className="muted small">{formatDate(j.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {mood && <span title={mood.l}>{mood.e} {mood.l}</span>}
                </div>
                {j.title && <h3>{j.title}</h3>}
                {j.body && <p className="pre">{j.body}</p>}
                {j.gratitude?.length > 0 && (
                  <div className="gratitude">
                    <strong className="small">Grateful for</strong>
                    <ul>{j.gratitude.map((g, i) => <li key={i}>{g}</li>)}</ul>
                  </div>
                )}
                <div className="card-actions">
                  <button className="btn" onClick={() => setEditing({ ...structuredClone(j), gratitude: [...(j.gratitude || []), '', '', ''].slice(0, Math.max(3, j.gratitude?.length || 0)) })}>Edit</button>
                  <button className="btn ghost danger" onClick={() => confirm('Delete this entry?') && dispatch({ type: 'remove', collection: 'journal', id: j.id })}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {editing && <EntryEditor draft={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function EntryEditor({ draft: initial, onSave, onClose }) {
  const [draft, setDraft] = useState(initial);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v?.target ? v.target.value : v }));
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  return (
    <Modal
      title={draft.id ? 'Edit entry' : 'New journal entry'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!draft.date} onClick={() => onSave(draft)}>Save entry</button>
        </>
      }
    >
      <div className="grid-2 tight">
        <Field label="Date"><input type="date" value={draft.date} onChange={set('date')} /></Field>
        <Field label="Title"><input value={draft.title} onChange={set('title')} placeholder="Optional" /></Field>
      </div>
      <Field label="Mood">
        <div className="mood-picker">
          {MOODS.map((m) => (
            <button key={m.v} type="button" className={draft.mood === m.v ? 'on' : ''} aria-pressed={draft.mood === m.v} onClick={() => set('mood')(m.v)} title={m.l}>
              <span>{m.e}</span><small>{m.l}</small>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Reflection"><textarea rows={6} value={draft.body} onChange={set('body')} placeholder={prompt} /></Field>
      <Field label="Three things I’m grateful for">
        <div className="stack">
          {draft.gratitude.map((g, i) => (
            <input key={i} value={g} onChange={(e) => setDraft((d) => ({ ...d, gratitude: d.gratitude.map((x, j) => (j === i ? e.target.value : x)) }))} placeholder={`${i + 1}.`} />
          ))}
        </div>
      </Field>
    </Modal>
  );
}
