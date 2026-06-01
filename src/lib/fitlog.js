// ── Pure domain logic (no React, no Firebase) — easy to reason about & test ──
import { TODAY, yesterdayISO } from './format';

export const MEAL_EMOJIS = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

/** Default empty state for a brand-new user / day. */
export function emptyState() {
  return {
    sessionName: 'Morning Session',
    exercises: [],
    meals: [],
    history: [],
    streak: 0,
    lastWorkoutDate: null,
  };
}

/** Roll over to a fresh day: clear today's working set, keep history & streak. */
export function freshDay(state) {
  if (state.lastWorkoutDate !== TODAY) {
    return { ...state, exercises: [], meals: [] };
  }
  return state;
}

export function makeExercise() {
  return {
    id: crypto.randomUUID(),
    name: '',
    sets: [{ reps: '', weight: '', done: false }],
  };
}

export function makeSet(prev) {
  return {
    reps: prev ? prev.reps : '',
    weight: prev ? prev.weight : '',
    done: false,
  };
}

export function setVolume(set) {
  return (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
}

/** Aggregate live workout stats from the exercise list. */
export function workoutStats(exercises) {
  let setsDone = 0;
  let volume = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.done) {
        setsDone += 1;
        volume += setVolume(set);
      }
    }
  }
  return { exercises: exercises.length, setsDone, volume };
}

/** Sum macros across all logged meals. */
export function macroTotals(meals) {
  return meals.reduce(
    (acc, m) => ({
      cal: acc.cal + (m.cal || 0),
      p: acc.p + (m.p || 0),
      c: acc.c + (m.c || 0),
      f: acc.f + (m.f || 0),
    }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
}

/** Streak rule: +1 if last workout was yesterday or today, else reset to 1. */
export function nextStreak(state) {
  const last = state.lastWorkoutDate;
  if (!last) return 1;
  if (last === yesterdayISO() || last === TODAY) return (state.streak || 0) + 1;
  return 1;
}
