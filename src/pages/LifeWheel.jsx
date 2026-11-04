import { useStore } from '../store.jsx';
import { PageHeader } from '../components/ui.jsx';

const SIZE = 340;
const C = SIZE / 2;
const R = 140;

function wedge(i, n, frac) {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const r = R * frac;
  const p = (a) => `${C + r * Math.cos(a)} ${C + r * Math.sin(a)}`;
  return `M ${C} ${C} L ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)} Z`;
}

export default function LifeWheel() {
  const { state, dispatch } = useStore();
  const areas = state.areas;
  const n = areas.length;
  const scores = areas.map((a) => state.wheel[a.id] ?? 5);
  const avg = n ? (scores.reduce((s, x) => s + x, 0) / n).toFixed(1) : '—';
  const lowest = areas.length ? areas[scores.indexOf(Math.min(...scores))] : null;

  return (
    <>
      <PageHeader title="Life Wheel" subtitle="Rate your satisfaction in each life area from 1 to 10 to spot where to focus next." />
      <div className="grid-2 wheel-layout">
        <section className="card wheel-card">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Life balance wheel">
            {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
              <circle key={f} cx={C} cy={C} r={R * f} className="wheel-ring" />
            ))}
            {areas.map((a, i) => (
              <path key={a.id} d={wedge(i, n, scores[i] / 10)} fill={a.color} fillOpacity="0.75" stroke="var(--surface)" strokeWidth="2">
                <title>{`${a.name}: ${scores[i]}/10`}</title>
              </path>
            ))}
            {areas.map((a, i) => {
              const ang = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
              return (
                <text key={a.id} x={C + (R + 14) * Math.cos(ang)} y={C + (R + 14) * Math.sin(ang)} textAnchor="middle" dominantBaseline="middle" className="wheel-label">
                  {scores[i]}
                </text>
              );
            })}
          </svg>
          <p className="center">Balance score <strong>{avg}</strong> / 10</p>
          {lowest && <p className="center muted small">Most room to grow: <strong>{lowest.name}</strong></p>}
        </section>
        <section className="card">
          <h2 className="card-title">Rate each area</h2>
          <ul className="sliders">
            {areas.map((a, i) => {
              const goals = state.goals.filter((g) => g.areaId === a.id && g.status !== 'completed').length;
              return (
                <li key={a.id}>
                  <div className="row-between">
                    <span className="tag" style={{ '--tag': a.color }}><span className="dot" />{a.name}</span>
                    <span className="muted small">{goals} active goal{goals !== 1 && 's'} · <strong>{scores[i]}</strong></span>
                  </div>
                  <input
                    type="range" min="1" max="10" value={scores[i]}
                    className="range"
                    style={{ '--c': a.color, '--fill': `${((scores[i] - 1) / 9) * 100}%` }}
                    aria-label={`${a.name} satisfaction`}
                    onChange={(e) => dispatch({ type: 'setWheel', areaId: a.id, score: Number(e.target.value) })}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
