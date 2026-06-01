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
    activeDate: null,        // calendar day the working set (exercises/meals) belongs to
    history: [],
    streak: 0,
    lastWorkoutDate: null,
    muscleGroupHistory: {},  // { [group: string]: ISO date string }
    cardioSessions: [],      // CardioSession[]
    customFoods: [],         // user-added foods, persisted across days
  };
}

/**
 * Roll over to a fresh day: clear today's working set, keep history & streak.
 *
 * Keyed off `activeDate` (the day the working set belongs to) — NOT
 * `lastWorkoutDate`, which only changes when a session is *finished*. Using
 * lastWorkoutDate here meant every Firestore snapshot wiped in-progress
 * exercises/meals until a workout was finished that day.
 */
export function freshDay(state) {
  if (state.activeDate !== TODAY) {
    return { ...state, exercises: [], meals: [], activeDate: TODAY };
  }
  return state;
}

export function makeExercise() {
  return {
    id: crypto.randomUUID(),
    name: '',
    muscleGroup: null,
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

/** Scale per-100g macros to an actual gram amount. */
export function scaleMacros(per100g, grams) {
  const g = Number(grams) || 0;
  return {
    cal: Math.round((per100g.cal * g) / 100),
    p: Math.round(((per100g.p * g) / 100) * 10) / 10,
    c: Math.round(((per100g.c * g) / 100) * 10) / 10,
    f: Math.round(((per100g.f * g) / 100) * 10) / 10,
  };
}

/** A meal is a container; each food item carries its own resolved macros. */
export function makeMeal(type) {
  return {
    id: crypto.randomUUID(),
    type,
    emoji: MEAL_EMOJIS[type],
    loggedAt: Date.now(),
    foods: [],
  };
}

/** Sum macros for a single meal's food items. */
export function mealMacros(meal) {
  const items = meal?.foods ?? [];
  return items.reduce(
    (acc, item) => ({
      cal: acc.cal + (item.cal || 0),
      p: acc.p + (item.p || 0),
      c: acc.c + (item.c || 0),
      f: acc.f + (item.f || 0),
    }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
}

/** Sum macros across every meal (and every food within each meal) for the day. */
export function macroTotals(meals) {
  return (meals ?? []).reduce(
    (acc, m) => {
      const mm = mealMacros(m);
      return {
        cal: acc.cal + mm.cal,
        p: acc.p + mm.p,
        c: acc.c + mm.c,
        f: acc.f + mm.f,
      };
    },
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

// ─────────────────────────────────────────────
// ── MUSCLE GROUP TRACKING ──
// ─────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'calves',
];

export const MUSCLE_RECOVERY_HOURS = {
  chest: 72,
  back: 72,
  shoulders: 72,
  biceps: 48,
  triceps: 48,
  legs: 72,
  core: 48,
  calves: 24,
};

const MUSCLE_PATTERNS = [
  { pattern: /bench|push.?up|fly|pec/i,                       group: 'chest' },
  { pattern: /pull.?up|pull.?down|row|lat\b|deadlift/i,       group: 'back' },
  { pattern: /squat|lunge|leg.?press|hamstring|glute|rdl/i,   group: 'legs' },
  { pattern: /shoulder|lateral.?raise|arnold|ohp/i,           group: 'shoulders' },
  { pattern: /\bbicep|\bcurl\b/i,                              group: 'biceps' },
  { pattern: /tricep|skull.?crusher|pushdown/i,                group: 'triceps' },
  { pattern: /plank|crunch|sit.?up|\bab\b|cable.?crunch/i,    group: 'core' },
  { pattern: /\bcalf\b|calves|calf.?raise/i,                   group: 'calves' },
];

/**
 * Auto-detect muscle group from an exercise name.
 * Returns a group string or null if no match.
 */
export function detectMuscleGroup(name) {
  if (!name) return null;
  for (const { pattern, group } of MUSCLE_PATTERNS) {
    if (pattern.test(name)) return group;
  }
  return null;
}

/**
 * Returns recovery status for every muscle group given muscleGroupHistory.
 * Status values: 'ready' | 'recovering' | 'needs_rest'
 */
export function muscleGroupStatuses(muscleGroupHistory = {}) {
  const nowMs = Date.now();
  return Object.fromEntries(
    MUSCLE_GROUPS.map((group) => {
      const lastDate = muscleGroupHistory[group];
      if (!lastDate) return [group, 'ready'];
      const hoursAgo =
        (nowMs - new Date(lastDate + 'T00:00:00').getTime()) / 3_600_000;
      const recovery = MUSCLE_RECOVERY_HOURS[group];
      if (hoursAgo < 24) return [group, 'needs_rest'];
      if (hoursAgo < recovery) return [group, 'recovering'];
      return [group, 'ready'];
    })
  );
}

/** Extract unique, non-null muscle groups from an exercises array. */
export function extractMuscleGroups(exercises) {
  return [...new Set(exercises.map((e) => e.muscleGroup).filter(Boolean))];
}

// ─────────────────────────────────────────────
// ── CARDIO ──
// ─────────────────────────────────────────────

export const CARDIO_TYPES = ['run', 'jog', 'walk'];

const CARDIO_MET = { run: 1.036, jog: 0.85, walk: 0.53 };

/**
 * Calculate pace and estimated calories for a cardio session.
 * @param {{ type, distanceKm, durationMin, weightKg? }} params
 * @returns {{ pace: number, calories: number }}
 *   pace in min/km (0 if distance is 0), calories estimated
 */
export function calcCardio({ type, distanceKm, durationMin, weightKg = 70 }) {
  const d = Number(distanceKm) || 0;
  const t = Number(durationMin) || 0;
  const pace = d > 0 ? Math.round((t / d) * 10) / 10 : 0;
  const calories = d > 0 ? Math.round(weightKg * d * (CARDIO_MET[type] ?? 1)) : 0;
  return { pace, calories };
}

/**
 * Compute cardio stats for the current week (last 7 days).
 * @returns {{ totalKm: number, sessions: number, bestPace: number }}
 *   bestPace is min/km — lower is faster (0 means no data)
 */
export function weeklyCardioStats(cardioSessions = []) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString().split('T')[0];
  const thisWeek = cardioSessions.filter((s) => s.date >= weekAgoISO);
  const totalKm = Math.round(
    thisWeek.reduce((s, c) => s + (c.distanceKm || 0), 0) * 10
  ) / 10;
  const bestPace = thisWeek
    .filter((c) => c.pace > 0)
    .reduce((best, c) => (best === 0 || c.pace < best ? c.pace : best), 0);
  return { totalKm, sessions: thisWeek.length, bestPace };
}
