import { useEffect } from 'react';
import { useStore } from '../store.jsx';

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Progress({ value, color }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export function AreaTag({ areaId }) {
  const { state } = useStore();
  const area = state.areas.find((a) => a.id === areaId);
  if (!area) return null;
  return (
    <span className="tag" style={{ '--tag': area.color }}>
      <span className="dot" />
      {area.name}
    </span>
  );
}

export function AreaSelect({ value, onChange, emptyLabel = 'No life area' }) {
  const { state } = useStore();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{emptyLabel}</option>
      {state.areas.map((a) => (
        <option key={a.id} value={a.id}>{a.name}</option>
      ))}
    </select>
  );
}

export function GoalSelect({ value, onChange }) {
  const { state } = useStore();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not linked to a goal</option>
      {state.goals.filter((g) => g.status !== 'completed' || g.id === value).map((g) => (
        <option key={g.id} value={g.id}>{g.title}</option>
      ))}
    </select>
  );
}

export function Empty({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
