import { useRef, useState } from 'react';
import { useStore, uid } from '../store.jsx';
import { dateKey } from '../dates.js';
import { Field, PageHeader } from '../components/ui.jsx';

export default function Settings() {
  const { state, dispatch } = useStore();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const [newArea, setNewArea] = useState({ name: '', color: '#6366f1' });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momentum-backup-${dateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!confirm('Replace all current data with this backup?')) return;
      dispatch({ type: 'replace', state: data });
      setMsg('Backup imported.');
    } catch {
      setMsg('That file is not a valid Momentum backup.');
    }
  };

  const addArea = (e) => {
    e.preventDefault();
    if (!newArea.name.trim()) return;
    dispatch({ type: 'add', collection: 'areas', item: { id: uid(), name: newArea.name.trim(), color: newArea.color } });
    setNewArea({ name: '', color: '#6366f1' });
  };

  const counts = ['goals', 'habits', 'tasks', 'journal'].map((k) => `${state[k].length} ${k === 'journal' ? 'entries' : k}`).join(' · ');

  return (
    <>
      <PageHeader title="Settings" subtitle="Personalize the planner and manage your data." />
      <section className="card">
        <h2 className="card-title">Profile</h2>
        <div className="grid-2 tight">
          <Field label="Your name"><input value={state.settings.name} onChange={(e) => dispatch({ type: 'settings', patch: { name: e.target.value } })} placeholder="Used in the dashboard greeting" /></Field>
          <Field label="Theme">
            <select value={state.settings.theme} onChange={(e) => dispatch({ type: 'settings', patch: { theme: e.target.value } })}>
              <option value="system">Match system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Life areas</h2>
        <ul className="area-list">
          {state.areas.map((a) => (
            <li key={a.id}>
              <input type="color" value={a.color} aria-label={`${a.name} color`} onChange={(e) => dispatch({ type: 'update', collection: 'areas', id: a.id, patch: { color: e.target.value } })} />
              <input value={a.name} aria-label="Area name" onChange={(e) => dispatch({ type: 'update', collection: 'areas', id: a.id, patch: { name: e.target.value } })} />
              <button
                className="icon-btn" aria-label={`Remove ${a.name}`}
                onClick={() => confirm(`Remove life area “${a.name}”? Items in it are kept.`) && dispatch({ type: 'remove', collection: 'areas', id: a.id })}
              >×</button>
            </li>
          ))}
        </ul>
        <form className="inline-add" onSubmit={addArea}>
          <input type="color" value={newArea.color} onChange={(e) => setNewArea((n) => ({ ...n, color: e.target.value }))} aria-label="New area color" />
          <input value={newArea.name} onChange={(e) => setNewArea((n) => ({ ...n, name: e.target.value }))} placeholder="New life area" aria-label="New area name" />
          <button className="btn" type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Your data</h2>
        <p className="muted">Everything is saved in this browser only ({counts}). Export a backup to move it to another device.</p>
        <div className="card-actions">
          <button className="btn primary" onClick={exportData}>Export backup (JSON)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
          <button className="btn ghost danger" onClick={() => confirm('Erase ALL goals, habits, tasks and journal entries? This cannot be undone.') && dispatch({ type: 'reset' })}>
            Erase everything
          </button>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
    </>
  );
}
