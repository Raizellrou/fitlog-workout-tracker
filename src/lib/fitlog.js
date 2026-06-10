// ── Pure domain logic (no React, no Firebase) — easy to reason about & test ──
import { TODAY, yesterdayISO } from './format';

export const MEAL_EMOJIS = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// ── PROFILE / BODY METRICS ──
export const SEX_OPTIONS = ['male', 'female'];

/** Activity multipliers for TDEE (used by the Phase 2 macro engine). */
export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Light', sub: '1–3 days / week', factor: 1.375 },
  { id: 'moderate', label: 'Moderate', sub: '3–5 days / week', factor: 1.55 },
  { id: 'active', label: 'Active', sub: '6–7 days / week', factor: 1.725 },
  { id: 'very_active', label: 'Athlete', sub: 'Hard daily training', factor: 1.9 },
];

/** Blank profile for a new user (metrics unset until they fill them in). */
export function emptyProfile() {
  return { sex: 'male', age: null, heightCm: null, weightKg: null, activityLevel: 'moderate' };
}

/** True once the core metrics needed for TDEE / macros are present. */
export function profileComplete(p) {
  return !!(p && p.age > 0 && p.heightCm > 0 && p.weightKg > 0);
}

// ── NUTRITION TARGETS (goal-driven macros) ──
// Approach follows Jacob Oestreicher: PROTEIN is the anchor (0.8–1.0 g per lb of
// bodyweight) and a lean bulk is a small FLAT surplus (~+150 kcal), not a % of
// TDEE. Fat is set ~0.9 g/kg and carbs fill whatever calories remain.
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export const LB_PER_KG = 2.20462;
export const PROTEIN_PER_LB_MIN = 0.8;
export const PROTEIN_PER_LB_MAX = 1.0;

export const GOAL_TYPES = [
  { id: 'lean_bulk', label: 'Lean Bulk', sub: 'Slow, lean gains', kcalDelta: 150 },
  { id: 'bulk', label: 'Bulk', sub: 'Faster muscle gain', kcalDelta: 350 },
  { id: 'maintain', label: 'Maintain', sub: 'Hold weight / recomp', kcalDelta: 0 },
  { id: 'cut', label: 'Cut', sub: 'Lose fat, keep muscle', kcalDelta: -500 },
];

export function emptyGoal() {
  return { type: 'lean_bulk', targetWeightKg: null, proteinPerLb: 1.0 };
}

/** Mifflin–St Jeor basal metabolic rate (kcal/day). */
export function bmrMifflin({ sex, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

/**
 * Goal-driven daily calorie + macro targets — or null if the profile is incomplete.
 * Protein is the anchor (0.8–1.0 g/lb, Jacob Oestreicher); fat ~0.9 g/kg; carbs fill the rest.
 * @returns {{ tdee, calories, protein, carbs, fat, proteinPerLb } | null}
 */
export function computeNutritionTargets(profile, goal) {
  if (!profileComplete(profile)) return null;
  const activity =
    ACTIVITY_LEVELS.find((a) => a.id === profile.activityLevel) ?? ACTIVITY_LEVELS[2];
  const tdee = bmrMifflin(profile) * activity.factor;
  const goalDef = GOAL_TYPES.find((g) => g.id === goal?.type) ?? GOAL_TYPES[0];
  const calories = Math.max(1000, Math.round(tdee + goalDef.kcalDelta));

  const perLb = clamp(goal?.proteinPerLb ?? 1.0, PROTEIN_PER_LB_MIN, PROTEIN_PER_LB_MAX);
  const protein = Math.round(profile.weightKg * LB_PER_KG * perLb); // the anchor
  const fat = Math.round(profile.weightKg * 0.9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { tdee: Math.round(tdee), calories, protein, carbs, fat, proteinPerLb: perLb };
}

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
    profile: emptyProfile(), // body metrics (sex / age / height / weight / activity)
    goal: emptyGoal(),       // { type, targetWeightKg, proteinPerLb } → drives macro targets
    weightLog: [],           // [{ id, date: ISO, kg }] — append-only, newest entry feeds profile
    units: 'metric',         // 'metric' | 'imperial' — display preference (storage always metric)
    notificationsEnabled: false, // true once the user grants browser Notification permission
  };
}

/** Most recent weight log entry sorted by date, or null. */
export function latestWeightEntry(weightLog = []) {
  if (!weightLog?.length) return null;
  return [...weightLog].sort((a, b) => b.date.localeCompare(a.date))[0];
}

/**
 * kg delta between the two most recent entries (positive = gained, negative = lost).
 * Returns null if fewer than two entries.
 */
export function weightDelta(weightLog = []) {
  if (!weightLog?.length || weightLog.length < 2) return null;
  const sorted = [...weightLog].sort((a, b) => b.date.localeCompare(a.date));
  return Math.round((sorted[0].kg - sorted[1].kg) * 10) / 10;
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

// ─────────────────────────────────────────────
// ── DASHBOARD / STREAK HELPERS ──
// ─────────────────────────────────────────────

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** ISO date (YYYY-MM-DD) for a Date offset by deltaDays. */
export function isoOffset(base, deltaDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().split('T')[0];
}

/**
 * Mon–Sun of the current week, each tagged 'done' | 'today' | 'empty'
 * based on which days have a workout in history.
 */
export function weekGrid(history = [], todayIso = TODAY) {
  const today = new Date(todayIso + 'T00:00:00');
  const jsDay = today.getDay(); // 0=Sun … 6=Sat
  const mondayDelta = jsDay === 0 ? -6 : 1 - jsDay;
  const workoutDates = new Set(history.map((h) => h.date));
  return WEEKDAYS.map((day, i) => {
    const iso = isoOffset(today, mondayDelta + i);
    let state = 'empty';
    if (workoutDates.has(iso)) state = 'done';
    else if (iso === todayIso) state = 'today';
    return { day, iso, state };
  });
}

/** Count distinct workout days within the last `n` days (today inclusive). */
export function activeDays(history = [], n = 7, todayIso = TODAY) {
  const cutoff = isoOffset(new Date(todayIso + 'T00:00:00'), -(n - 1));
  return new Set(history.filter((h) => h.date >= cutoff).map((h) => h.date)).size;
}

/** Most recent workout date in history, or null. */
export function lastWorkoutIso(history = []) {
  return history.reduce((latest, h) => (!latest || h.date > latest ? h.date : latest), null);
}

/** Macro split expressed as % of total calories. */
export function macroPercents({ p = 0, c = 0, f = 0 } = {}) {
  const pc = p * 4;
  const cc = c * 4;
  const fc = f * 9;
  const tot = pc + cc + fc;
  if (!tot) return { p: 0, c: 0, f: 0 };
  return {
    p: Math.round((pc / tot) * 100),
    c: Math.round((cc / tot) * 100),
    f: Math.round((fc / tot) * 100),
  };
}

// ─────────────────────────────────────────────
// ── CONSISTENCY SCORE ──
// ─────────────────────────────────────────────

/** Ideal workout sessions per week used for frequency scoring. */
const IDEAL_WORKOUTS_PER_WEEK = 4;

/**
 * Balanced Consistency Score (0–100) blending four pillars:
 *
 *  50% — Workout frequency: active days in the last 28, ideal = 4/week (16 total)
 *  25% — Streak:            current streak normalised to a 30-day ceiling
 *  15% — Recovery:          proportion of trained muscle groups NOT in "needs_rest"
 *  10% — Cardio:            sessions in the last 7 days, ideal = 2
 *
 * All four components are 0–100 before blending, so the weights are transparent.
 */
export function consistencyScore(state) {
  const history          = state.history          ?? [];
  const streak           = state.streak           ?? 0;
  const cardioSessions   = state.cardioSessions   ?? [];
  const muscleGrpHistory = state.muscleGroupHistory ?? {};

  // 1. Frequency (50 %)
  const IDEAL_28 = IDEAL_WORKOUTS_PER_WEEK * 4;
  const days28   = activeDays(history, 28);
  const freqScore = Math.min(100, Math.round((days28 / IDEAL_28) * 100));

  // 2. Streak (25 %) — 30-day streak = 100
  const streakScore = Math.min(100, Math.round((Math.min(streak, 30) / 30) * 100));

  // 3. Recovery adherence (15 %) — no overtrained ("needs_rest") muscle groups
  const statuses    = Object.values(muscleGroupStatuses(muscleGrpHistory));
  const trained     = statuses.filter((s) => s !== 'ready'); // groups that have been worked
  const recoveryScore =
    trained.length === 0
      ? 100 // no muscles worked yet → no violations
      : Math.round(
          (trained.filter((s) => s !== 'needs_rest').length / trained.length) * 100,
        );

  // 4. Cardio (10 %) — 2 sessions/week = 100
  const { sessions: cardioWeek } = weeklyCardioStats(cardioSessions);
  const cardioScore = Math.min(100, Math.round((cardioWeek / 2) * 100));

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        0.50 * freqScore +
        0.25 * streakScore +
        0.15 * recoveryScore +
        0.10 * cardioScore,
      ),
    ),
  );
}

/**
 * Per-week workout-frequency scores for the last `weeks` weeks, oldest → newest.
 * The final (current-week) entry is replaced with the real full `consistencyScore`
 * so the trend line ends at the true score.
 *
 * @returns {number[]} Array of `weeks` values in [0, 100].
 */
export function consistencyTrend(state, weeks = 5, todayIso = TODAY) {
  const history = state.history ?? [];
  const scores  = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd   = isoOffset(new Date(todayIso + 'T00:00:00'), -(i * 7));
    const weekStart = isoOffset(new Date(todayIso + 'T00:00:00'), -((i + 1) * 7));
    const count = new Set(
      history.filter((h) => h.date > weekStart && h.date <= weekEnd).map((h) => h.date),
    ).size;
    scores.push(Math.min(100, Math.round((count / IDEAL_WORKOUTS_PER_WEEK) * 100)));
  }

  // Anchor the last data-point to the live full score so the ring and trend agree
  scores[scores.length - 1] = consistencyScore(state);
  return scores;
}
