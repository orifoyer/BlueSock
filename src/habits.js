import { addDays, dateKey } from './dates.js';

/** True if the habit is scheduled on this date (frequency = array of weekday numbers, 0 = Sunday). */
export function isScheduled(habit, date) {
  return habit.days.includes(date.getDay());
}

/**
 * Current streak: consecutive scheduled days ending today (or yesterday, if
 * today isn't done yet) that were completed. Unscheduled days are skipped.
 */
export function currentStreak(habit, today = new Date()) {
  let streak = 0;
  let d = new Date(today);
  // Today not done yet doesn't break the streak.
  if (isScheduled(habit, d) && !habit.log[dateKey(d)]) d = addDays(d, -1);
  const created = habit.createdAt ? new Date(habit.createdAt) : addDays(today, -366);
  for (let i = 0; i < 366; i++) {
    if (d < addDays(created, -1)) break;
    if (isScheduled(habit, d)) {
      if (habit.log[dateKey(d)]) streak++;
      else break;
    }
    d = addDays(d, -1);
  }
  return streak;
}

/** Completion rate (0–1) over the last `days` scheduled days, including today. */
export function completionRate(habit, days = 30, today = new Date()) {
  let scheduled = 0;
  let done = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(today, -i);
    if (!isScheduled(habit, d)) continue;
    scheduled++;
    if (habit.log[dateKey(d)]) done++;
  }
  return scheduled ? done / scheduled : 0;
}
