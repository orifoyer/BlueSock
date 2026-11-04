import { useStore, goalProgress } from '../store.jsx';
import { dateKey, daysUntil, formatDate } from '../dates.js';
import { currentStreak, isScheduled } from '../habits.js';
import { AreaTag, PageHeader, Progress } from '../components/ui.jsx';

const QUOTES = [
  'Small steps every day add up to big results.',
  'What you do today shapes who you become tomorrow.',
  'Focus on progress, not perfection.',
  'A goal without a plan is just a wish.',
  'Discipline is choosing what you want most over what you want now.',
  'You don’t have to be great to start, but you have to start to be great.',
  'Habits are the compound interest of self-improvement.',
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const today = new Date();
  const tKey = dateKey(today);
  const quote = QUOTES[Math.floor(today.getTime() / 86400000) % QUOTES.length];

  const activeGoals = state.goals.filter((g) => g.status !== 'completed');
  const completedGoals = state.goals.length - activeGoals.length;
  const todaysHabits = state.habits.filter((h) => isScheduled(h, today));
  const habitsDone = todaysHabits.filter((h) => h.log[tKey]).length;
  const openTasks = state.tasks.filter((t) => !t.done);
  const dueTasks = openTasks
    .filter((t) => t.dueDate && t.dueDate <= tKey)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = openTasks
    .filter((t) => t.dueDate && t.dueDate > tKey)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const bestStreak = state.habits.reduce((m, h) => Math.max(m, currentStreak(h, today)), 0);
  const journaledToday = state.journal.some((j) => j.date === tKey);

  const name = state.settings.name ? `, ${state.settings.name}` : '';

  return (
    <>
      <PageHeader
        title={`${greeting()}${name}`}
        subtitle={today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      />
      <blockquote className="card quote">“{quote}”</blockquote>

      <section className="stats">
        <Stat label="Active goals" value={activeGoals.length} sub={`${completedGoals} achieved`} href="#/goals" />
        <Stat label="Habits today" value={`${habitsDone}/${todaysHabits.length}`} sub={`Best streak ${bestStreak}d`} href="#/habits" />
        <Stat label="Open tasks" value={openTasks.length} sub={`${dueTasks.length} due or overdue`} href="#/tasks" />
        <Stat label="Journal" value={state.journal.length} sub={journaledToday ? 'Written today ✓' : 'Nothing today yet'} href="#/journal" />
      </section>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Today’s habits</h2>
          {todaysHabits.length === 0 ? (
            <p className="muted">No habits scheduled today. <a href="#/habits">Add a habit</a></p>
          ) : (
            <ul className="check-list">
              {todaysHabits.map((h) => (
                <li key={h.id}>
                  <label>
                    <input type="checkbox" checked={!!h.log[tKey]} onChange={() => dispatch({ type: 'toggleHabit', id: h.id, date: tKey })} />
                    <span className={h.log[tKey] ? 'done' : ''}>{h.title}</span>
                  </label>
                  <span className="muted small">🔥 {currentStreak(h, today)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Due today &amp; overdue</h2>
          {dueTasks.length === 0 ? (
            <p className="muted">You’re all caught up.</p>
          ) : (
            <ul className="check-list">
              {dueTasks.map((t) => (
                <li key={t.id}>
                  <label>
                    <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'update', collection: 'tasks', id: t.id, patch: { done: true, completedAt: new Date().toISOString() } })} />
                    <span>{t.title}</span>
                  </label>
                  <span className={`small ${t.dueDate < tKey ? 'danger' : 'muted'}`}>
                    {t.dueDate < tKey ? `Overdue ${-daysUntil(t.dueDate)}d` : 'Today'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {upcoming.length > 0 && (
            <>
              <h3 className="sub-title">Coming up</h3>
              <ul className="plain-list">
                {upcoming.map((t) => (
                  <li key={t.id}><span>{t.title}</span><span className="muted small">{formatDate(t.dueDate, { month: 'short', day: 'numeric' })}</span></li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="card-title">Goal progress</h2>
        {activeGoals.length === 0 ? (
          <p className="muted">Set your first goal to start tracking progress. <a href="#/goals">Create a goal</a></p>
        ) : (
          <ul className="goal-mini">
            {activeGoals.map((g) => {
              const p = goalProgress(g);
              const area = state.areas.find((a) => a.id === g.areaId);
              const d = daysUntil(g.targetDate);
              return (
                <li key={g.id}>
                  <div className="row-between">
                    <strong>{g.title}</strong>
                    <span className="muted small">{p}%{d !== null && ` · ${d >= 0 ? `${d}d left` : `${-d}d past target`}`}</span>
                  </div>
                  <Progress value={p} color={area?.color} />
                  <AreaTag areaId={g.areaId} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, sub, href }) {
  return (
    <a className="card stat" href={href}>
      <span className="muted small">{label}</span>
      <span className="stat-value">{value}</span>
      <span className="muted small">{sub}</span>
    </a>
  );
}
