import { useEffect, useState } from 'react';
import { useStore } from './store.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Goals from './pages/Goals.jsx';
import Habits from './pages/Habits.jsx';
import Tasks from './pages/Tasks.jsx';
import Journal from './pages/Journal.jsx';
import LifeWheel from './pages/LifeWheel.jsx';
import Settings from './pages/Settings.jsx';

const ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: '◎', Page: Dashboard },
  { id: 'goals', label: 'Goals', icon: '◆', Page: Goals },
  { id: 'habits', label: 'Habits', icon: '↻', Page: Habits },
  { id: 'tasks', label: 'Tasks', icon: '✓', Page: Tasks },
  { id: 'journal', label: 'Journal', icon: '✎', Page: Journal },
  { id: 'wheel', label: 'Life Wheel', icon: '✺', Page: LifeWheel },
  { id: 'settings', label: 'Settings', icon: '⚙', Page: Settings },
];

function currentRoute() {
  const id = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.find((r) => r.id === id) ? id : 'dashboard';
}

export default function App() {
  const { state } = useStore();
  const [route, setRoute] = useState(currentRoute);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      setMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const t = state.settings.theme;
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }, [state.settings.theme]);

  const { Page } = ROUTES.find((r) => r.id === route);

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <img src="./favicon.svg" alt="" width="28" height="28" />
          <span>Momentum</span>
        </div>
        <nav aria-label="Main">
          {ROUTES.map((r) => (
            <a key={r.id} href={`#/${r.id}`} className={r.id === route ? 'active' : ''} aria-current={r.id === route ? 'page' : undefined}>
              <span className="nav-icon" aria-hidden>{r.icon}</span>
              {r.label}
            </a>
          ))}
        </nav>
        <p className="sidebar-foot muted">Data is stored in this browser.</p>
      </aside>
      <div className="topbar">
        <button className="icon-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">☰</button>
        <span className="brand-small">Momentum</span>
      </div>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
      <main className="content">
        <Page />
      </main>
    </div>
  );
}
