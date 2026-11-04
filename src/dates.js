export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Local-time YYYY-MM-DD key for a Date. */
export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** The 7 dates of the week (Mon–Sun) containing `d`, shifted by `offsetWeeks`. */
export function weekDates(d = new Date(), offsetWeeks = 0) {
  const base = addDays(d, offsetWeeks * 7);
  const mondayShift = (base.getDay() + 6) % 7;
  const monday = addDays(base, -mondayShift);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatDate(key, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!key) return '';
  return parseKey(key).toLocaleDateString(undefined, opts);
}

export function daysUntil(key, today = new Date()) {
  if (!key) return null;
  const a = parseKey(dateKey(today));
  const b = parseKey(key);
  return Math.round((b - a) / 86400000);
}
