import { createContext, useContext, useEffect, useReducer } from 'react';

export const STORAGE_KEY = 'momentum-planner-v1';

export const DEFAULT_AREAS = [
  { id: 'health', name: 'Health & Fitness', color: '#10b981' },
  { id: 'career', name: 'Career', color: '#3b82f6' },
  { id: 'finance', name: 'Finance', color: '#f59e0b' },
  { id: 'relationships', name: 'Relationships', color: '#ec4899' },
  { id: 'growth', name: 'Personal Growth', color: '#8b5cf6' },
  { id: 'fun', name: 'Fun & Recreation', color: '#06b6d4' },
  { id: 'spirit', name: 'Spirituality', color: '#a855f7' },
  { id: 'home', name: 'Home & Environment', color: '#84cc16' },
];

export const COLLECTIONS = ['goals', 'habits', 'tasks', 'journal', 'areas'];

export function initialState() {
  return {
    version: 1,
    areas: DEFAULT_AREAS,
    goals: [],
    habits: [],
    tasks: [],
    journal: [],
    wheel: {}, // areaId -> score 1..10
    settings: { name: '', theme: 'system' },
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Merge a possibly partial/older saved state onto defaults. */
export function hydrate(saved) {
  const base = initialState();
  if (!saved || typeof saved !== 'object') return base;
  const out = { ...base };
  for (const k of COLLECTIONS) if (Array.isArray(saved[k])) out[k] = saved[k];
  if (saved.wheel && typeof saved.wheel === 'object') out.wheel = saved.wheel;
  if (saved.settings && typeof saved.settings === 'object') out.settings = { ...base.settings, ...saved.settings };
  return out;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        [action.collection]: [
          ...state[action.collection],
          { id: uid(), createdAt: new Date().toISOString(), ...action.item },
        ],
      };
    case 'update':
      return {
        ...state,
        [action.collection]: state[action.collection].map((x) =>
          x.id === action.id ? { ...x, ...action.patch } : x,
        ),
      };
    case 'remove': {
      const next = {
        ...state,
        [action.collection]: state[action.collection].filter((x) => x.id !== action.id),
      };
      // Detach references to a removed goal.
      if (action.collection === 'goals') {
        next.tasks = next.tasks.map((t) => (t.goalId === action.id ? { ...t, goalId: '' } : t));
        next.habits = next.habits.map((h) => (h.goalId === action.id ? { ...h, goalId: '' } : h));
      }
      return next;
    }
    case 'toggleHabit':
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h;
          const log = { ...h.log };
          if (log[action.date]) delete log[action.date];
          else log[action.date] = true;
          return { ...h, log };
        }),
      };
    case 'toggleMilestone':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id !== action.goalId
            ? g
            : {
                ...g,
                milestones: g.milestones.map((m) =>
                  m.id === action.milestoneId ? { ...m, done: !m.done } : m,
                ),
              },
        ),
      };
    case 'setWheel':
      return { ...state, wheel: { ...state.wheel, [action.areaId]: action.score } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'replace':
      return hydrate(action.state);
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

export function goalProgress(goal) {
  if (goal.status === 'completed') return 100;
  const ms = goal.milestones || [];
  if (!ms.length) return 0;
  return Math.round((ms.filter((m) => m.done).length / ms.length) * 100);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return hydrate(raw ? JSON.parse(raw) : null);
  } catch {
    return initialState();
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — keep working in memory */
    }
  }, [state]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
