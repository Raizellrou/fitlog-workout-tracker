# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FitLog** is a workout & nutrition tracker PWA with multi-device cloud sync via Firebase. Users sign in with email/password, log exercises (sets/reps/weight), meals (macro-tracked), and cardio sessions. Data syncs in real time across devices and is installable to the home screen on iOS/Android. Deployed on Vercel.

## Commands

```bash
npm run dev       # Vite dev server with HMR on :5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint
npm run format    # Prettier --write
```

No test runner is configured. The project is plain JavaScript + JSX (no TypeScript).

## Environment Setup

Copy `.env.example` → `.env` and fill in Firebase web config. All `VITE_FIREBASE_*` vars (except `MEASUREMENT_ID`) are validated at startup in `src/firebase.js` — the app throws a descriptive error if any are missing.

## Architecture

**Stack**: React 19 + Vite 6, Tailwind CSS v4, Firebase 11 (Firestore + email/password Auth), `lucide-react` icons, `vite-plugin-pwa`.

**Path alias**: `@/` → `src/`.

### Data flow (critical)

**One source of truth**: `useFitlogData` hook (`src/hooks/useFitlogData.js`).

1. Paints instantly from `localStorage` cache (key `fitlog_v1`).
2. Subscribes to `users/{uid}/data/fitlog` via Firestore `onSnapshot`.
3. `update(updater)` writes optimistically: React state → cache → Firestore atomically inside `setState`. Always mutate through `update()` — never call Firestore directly from a component.

`freshDay()` is called on every cache read and Firestore snapshot. It clears `exercises` and `meals` when `state.activeDate !== TODAY` — keyed off `activeDate`, **not** `lastWorkoutDate` (which only updates on session finish).

### Firestore layout

| Path | Contents |
|---|---|
| `users/{uid}/data/fitlog` | Single doc — entire app state (see `emptyState()` in `lib/fitlog.js`) |

Security rules in `firestore.rules`: email-verified owner only, field allow-list, scalar type checks, array size caps. Deploy with `firebase deploy --only firestore:rules`.

### State shape

```js
{
  sessionName: string,
  exercises: Exercise[],       // working set — cleared daily
  meals: Meal[],               // working set — cleared daily
  activeDate: ISO | null,      // day the working set belongs to
  history: Session[],          // persisted workout history (capped ≤500 on Firestore write)
  streak: number,
  lastWorkoutDate: ISO | null,
  muscleGroupHistory: { [group]: ISO },
  cardioSessions: CardioSession[],  // capped ≤500 on Firestore write
  customFoods: Food[],         // user-defined, persisted across days
  profile: { sex, age, heightCm, weightKg, activityLevel },  // body metrics
  goal: { type, targetWeightKg, proteinPerLb },              // drives macro targets
  weightLog: [{ id, date, kg }],    // body-weight entries (capped ≤365 on Firestore write)
  units: 'metric' | 'imperial',     // display preference — storage always metric
  notificationsEnabled: boolean,     // true after Notification permission granted + toggled on
}
```

A `Meal` is a container: `{ id, type, emoji, loggedAt, foods: FoodItem[] }`. Macros are never stored on the meal itself — always derived via `mealMacros(meal)`.

`readCache()` merges over `emptyState()` (`{ ...emptyState(), ...cached }`) so docs saved before a field existed still get sane defaults — always add new state fields to `emptyState()`.

### Directory map

```
src/
├── App.jsx                    # 4-tab shell; routes to screens; no business logic
├── firebase.js                # Firebase init + env validation
├── index.css                  # Tailwind v4 @theme tokens + global styles
├── context/
│   ├── AuthContext.jsx         # Email/password auth (signIn, signUp, signOut, deleteAccount, reloadUser)
│   └── ToastContext.jsx        # Global showToast()
├── hooks/
│   ├── useFitlogData.js        # Firestore sync + localStorage cache (SoT) + trimForFirestore()
│   └── useFoodSearch.js        # Searches local FOODS + customFoods by substring
├── lib/
│   ├── fitlog.js               # Pure domain logic: factories, stats, streak, recovery, consistencyScore
│   ├── foodData.js             # Static USDA-seeded food table (~80 foods + variants)
│   └── format.js               # Date/number formatting + unit conversion helpers (kgToLb, cmToFtIn, …)
├── components/
│   ├── SignIn.jsx              # Email/password sign-in + sign-up form (generic error messages)
│   ├── EmailVerification.jsx   # Post-sign-up email verification gate (resend + reload)
│   └── ui/                    # 16 shared design-system primitives (see below)
└── screens/
    ├── DashboardScreen.jsx     # Hero card, Consistency Score, intake, notices
    ├── ExerciseScreen.jsx      # Weekly streak, grouped exercises, Log Workout, Cardio
    ├── NutritionScreen.jsx     # Calorie arc gauge, meal list, Add Meal sheet
    └── SettingsScreen.jsx      # Profile, goal, activity history, settings toggles
```

### Shared UI components (`src/components/ui/`)

All screens are built exclusively from these primitives — no one-off card/row markup in screens:

| Component | Purpose |
|---|---|
| `AppScreen` | Screen wrapper with consistent padding |
| `TopBar` | `large-left` (title + bell) or `centered` variant |
| `Card` | Elevated surface: `bg-surface`, border, `rounded-[22px]` |
| `GradientButton` | Full-width violet-gradient CTA with glow |
| `FAB` | Round violet `+` button |
| `ArcGauge` | 270° ring gauge with centered value (calorie intake) |
| `ScoreRing` | Circular SVG ring + trend line overlay (Consistency Score) |
| `ProgressBar` | Rounded track + violet-gradient fill |
| `StatPill` | Labeled value tile (Height / Weight) |
| `MacroRow` | Colored dot + label + percentage |
| `NoticeCard` | Icon + text, tone: `neutral` / `warning` / `danger` |
| `ListRow` | Icon tile + title + subtitle + trailing slot |
| `DayStreakCell` | Vertical day pill: `done` / `today` / `empty` |
| `Toggle` | Violet on-state switch |
| `BottomSheet` | Slide-up modal shell: drag handle + header + scroll body + sticky footer (`z-[200]`, above the nav) |
| `BottomTabBar` | 4-tab nav (Dashboard · Exercise · Food · Settings). **Fixed** floating glass bar (`fixed bottom-0`, centered to the 480px column, `z-40`); `<main>` carries `padding-bottom: var(--nav-height)` so content clears it |

### Design system

Dark violet "fintech-grade" aesthetic. All colors come from CSS custom properties — **no hardcoded hex in components**.

Key tokens (defined in `index.css` `:root` and `@theme`):
- `--color-base: #0a0a0f` — app background
- `--color-surface: #16161f` — cards
- `--color-surface-2: #1e1e2a` — nested surfaces / list rows
- `--accent-gradient: linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)`
- `--color-success: #4ade80` / `--color-danger: #f87171` / `--color-warning: #fbbf24`

Gradients/glows only on primary CTAs and active/featured elements, not on every card. Tailwind v4 utilities (`bg-surface`, `text-accent`, `text-muted`, `text-ink`) map directly to these tokens.

### Food system

`src/lib/foodData.js` — ~80 USDA-seeded foods with per-100g macros. Every food has ≥1 variant (foods with one variant use `label: 'default'`) so the `scaleMacros(per100g, grams)` path is always uniform. Custom foods are stored in `state.customFoods` and synced via Firestore.

`useFoodSearch(customFoods)` returns `{ query, setQuery, results, loading, clearResults }` — synchronous substring search, no API calls.

### Nutrition targets (goal-driven macros)

Daily calorie + macro targets are derived from the user's `profile` + `goal` via `computeNutritionTargets(profile, goal)` (pure, in `lib/fitlog.js`). The model follows **Jacob Oestreicher**:

- **Protein is the anchor** — `0.8–1.0 g per lb` of bodyweight (`goal.proteinPerLb`, user-adjustable).
- Calories = Mifflin–St Jeor BMR × activity factor (`ACTIVITY_LEVELS`) + a **flat** goal delta (`GOAL_TYPES`: Lean Bulk +150 · Bulk +350 · Maintain 0 · Cut −500), **not** a percentage.
- Fat ≈ `0.9 g/kg`; carbs fill the remaining calories.
- Returns `null` until `profileComplete(profile)` — screens fall back to a 2400 kcal placeholder.

Consumers: Dashboard intake card + weight-to-goal notice, Nutrition `ArcGauge`, Settings goal picker (live preview).

### Key domain functions (`lib/fitlog.js`)

| Function | What it does |
|---|---|
| `freshDay(state)` | Resets exercises/meals if `activeDate !== TODAY` |
| `makeExercise()` | Factory for a new exercise with one empty set |
| `scaleMacros(per100g, grams)` | Scales per-100g macros to actual portion |
| `makeMeal(type)` | Creates a meal container (foods added separately) |
| `mealMacros(meal)` | Sums macros across all food items in a meal |
| `macroTotals(meals)` | Sums macros across all meals |
| `macroPercents({p,c,f})` | Converts gram values to % of total kcal |
| `weekGrid(history, today)` | Mon–Sun cells tagged `done`/`today`/`empty` |
| `activeDays(history, n)` | Count distinct workout days in last n days |
| `muscleGroupStatuses(muscleGroupHistory)` | `ready`/`recovering`/`needs_rest` per group |
| `nextStreak(state)` | Increments or resets streak |
| `computeNutritionTargets(profile, goal)` | Goal-driven daily calorie + macro targets (protein-anchored, Jacob model), or `null` if profile incomplete |
| `bmrMifflin(profile)` | Mifflin–St Jeor basal metabolic rate |
| `emptyProfile()` / `emptyGoal()` | Factory defaults for `profile` / `goal` |
| `profileComplete(p)` | True once age/height/weight are set |
| `consistencyScore(state)` | Balanced 0–100 score: frequency 50%, streak 25%, recovery 15%, cardio 10% |
| `consistencyTrend(state, weeks)` | Per-week frequency scores (oldest → newest), last entry = live full score |
| `latestWeightEntry(weightLog)` | Most recent `{ id, date, kg }` entry, or `null` |
| `weightDelta(weightLog)` | kg diff between the two most recent entries, or `null` |

## Key Conventions

- All app state mutates through `useFitlogData`'s `update(fn)` only.
- `update()` accepts a function `(prevState) => nextState` or a plain object (shallow-merged).
- Use `crypto.randomUUID()` for all IDs.
- Keep `lib/fitlog.js` and `lib/foodData.js` pure (no React, no Firebase imports).
- Cardio is a sub-section inside the Exercise tab — there is no dedicated Cardio screen.
- **All data is real** — nothing is mocked. Every number on the Dashboard, Nutrition, and Exercise screens is driven by actual logged data. The Consistency Score, weight trend, macro targets, workout timer, and notifications are all live.
- Storage is always metric (kg / cm). Imperial display is a view-only conversion controlled by `state.units`.
- `useFitlogData` trims arrays before Firestore writes (`trimForFirestore`) to stay within the 1 MiB doc limit.
- Email verification is required — unverified users see `EmailVerification.jsx` and are blocked by Firestore rules.

## Build roadmap

`PROGRESS.md` (repo root) tracks the phased build. **All phases complete (0–6):** sticky nav, profile, goals + macro engine, body-weight log, Consistency Score, extras (units, custom food, notifications, workout timer), and security hardening (Firestore rules, email verification, security headers, account deletion, data export, doc-size trimming).

Remaining ops items (not blocking): Firebase App Check (needs Console access), dependency hygiene (Dependabot), billing budgets.

`preview.html` + `src/preview/` are a **dev-only** UI harness (mock data, no Firebase/auth) for fast visual iteration — not shipped by the production build.

## Deploy (Vercel)

1. Import the GitHub repo — Vite is auto-detected.
2. Set all `VITE_FIREBASE_*` env vars in Project Settings.
3. Add the deployed domain to **Firebase Console → Authentication → Authorized domains**.
