import { describe, expect, it } from 'vitest';
import { reducer, initialState, hydrate, goalProgress } from './store.jsx';
import { currentStreak, completionRate } from './habits.js';
import { dateKey, addDays, weekDates } from './dates.js';

const today = new Date(2026, 10, 4); // Wed Nov 4 2026

describe('dates', () => {
  it('weekDates starts on Monday', () => {
    const w = weekDates(today);
    expect(w).toHaveLength(7);
    expect(w[0].getDay()).toBe(1);
    expect(dateKey(w[0])).toBe('2026-11-02');
  });
});

describe('habits', () => {
  const daily = { days: [0, 1, 2, 3, 4, 5, 6], log: {}, createdAt: '2026-01-01' };
  it('streak counts back from yesterday when today is not done', () => {
    const log = {};
    for (let i = 1; i <= 3; i++) log[dateKey(addDays(today, -i))] = true;
    expect(currentStreak({ ...daily, log }, today)).toBe(3);
    log[dateKey(today)] = true;
    expect(currentStreak({ ...daily, log }, today)).toBe(4);
  });
  it('unscheduled days do not break streak', () => {
    const weekdays = { days: [1, 2, 3, 4, 5], createdAt: '2026-01-01', log: {} };
    // Mon Nov 2, Tue Nov 3, Wed Nov 4 + previous Fri Oct 30
    ['2026-10-30', '2026-11-02', '2026-11-03', '2026-11-04'].forEach((k) => (weekdays.log[k] = true));
    expect(currentStreak(weekdays, today)).toBe(4);
  });
  it('completion rate', () => {
    const log = { [dateKey(today)]: true };
    expect(completionRate({ ...daily, log }, 10, today)).toBeCloseTo(0.1);
  });
});

describe('store reducer', () => {
  it('adds, toggles and removes, detaching goal links', () => {
    let s = initialState();
    s = reducer(s, { type: 'add', collection: 'goals', item: { title: 'G', milestones: [{ id: 'm1', title: 'a', done: false }, { id: 'm2', title: 'b', done: false }] } });
    const g = s.goals[0];
    expect(goalProgress(g)).toBe(0);
    s = reducer(s, { type: 'toggleMilestone', goalId: g.id, milestoneId: 'm1' });
    expect(goalProgress(s.goals[0])).toBe(50);
    s = reducer(s, { type: 'add', collection: 'tasks', item: { title: 'T', goalId: g.id } });
    s = reducer(s, { type: 'remove', collection: 'goals', id: g.id });
    expect(s.goals).toHaveLength(0);
    expect(s.tasks[0].goalId).toBe('');
  });
  it('toggleHabit adds and removes a log entry', () => {
    let s = reducer(initialState(), { type: 'add', collection: 'habits', item: { title: 'H', days: [1], log: {} } });
    const id = s.habits[0].id;
    s = reducer(s, { type: 'toggleHabit', id, date: '2026-11-04' });
    expect(s.habits[0].log['2026-11-04']).toBe(true);
    s = reducer(s, { type: 'toggleHabit', id, date: '2026-11-04' });
    expect(s.habits[0].log['2026-11-04']).toBeUndefined();
  });
  it('hydrate tolerates junk', () => {
    expect(hydrate(null).areas.length).toBeGreaterThan(0);
    expect(hydrate({ goals: 'x', tasks: [{ id: 1 }] }).tasks).toHaveLength(1);
  });
});
