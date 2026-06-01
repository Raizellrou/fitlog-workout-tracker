# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**FitLog** is a workout & food tracker **PWA** with multi-device cloud sync.
Users sign in with Google, log workouts (exercises/sets/reps/weight) and
nutrition (calories + macros), and their data syncs in real time across every
device. Installable to the home screen on iOS and Android.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint
npm run format    # Prettier --write
```

No test runner is configured yet. The project is plain JavaScript + JSX (no
TypeScript).

## Environment Setup

Copy `.env.example` → `.env` and fill in your Firebase web config. All
`VITE_FIREBASE_*` vars (except `MEASUREMENT_ID`) are validated at startup in
[src/firebase.js](src/firebase.js) — the app throws a descriptive error if any
are missing. On Vercel, set the same vars in **Project Settings → Environment
Variables**.

## Architecture

**Stack**: React 19 + Vite, Tailwind CSS v4, Firebase (Firestore + Auth),
Recharts, `vite-plugin-pwa`. Hosted on **Vercel**.

**Path alias**: `@/` → `src/` (configured in [vite.config.js](vite.config.js)).

### Data flow (important)

There is **one** source of truth: the `useFitlogData` hook.

1. Paints instantly from a `localStorage` cache (key `fitlog_v1`).
2. Subscribes to `users/{uid}/data/fitlog` via Firestore `onSnapshot` for
   real-time cross-device sync.
3. `update(updater)` writes optimistically to React state + cache, then to
   Firestore. Always mutate state through `update()` — never write Firestore
   directly from a component.

The session stopwatch (`useTimer`) is **device-local only** (its own
`localStorage` key) so per-second ticks never hit Firestore.

### Firestore layout

| Path | Contents |
|---|---|
| `users/{uid}/data/fitlog` | Single doc: `{ sessionName, exercises[], meals[], history[], streak, lastWorkoutDate }` |

Security rules ([firestore.rules](firestore.rules)): a user may only access
documents under their own `users/{uid}` tree.

### Directory map

```
src/
├── main.jsx              # Entry: wraps App in Auth + Toast providers
├── App.jsx               # Tab routing, session-finish flow, CTA wiring
├── firebase.js           # Firebase init + env validation
├── index.css             # Tailwind v4 import, @theme tokens, component styles
├── context/
│   ├── AuthContext.jsx    # Google auth state (user, signIn, signOut)
│   └── ToastContext.jsx   # Global showToast()
├── hooks/
│   ├── useFitlogData.js   # Firestore sync + localStorage cache (SoT)
│   └── useTimer.js        # Local session stopwatch
├── lib/
│   ├── fitlog.js          # Pure domain logic (stats, streak, factories)
│   └── format.js          # Date/number formatting helpers
├── components/            # Header, TabNav, SignIn, EmptyState, FinishModal
└── screens/               # WorkoutScreen, FoodScreen, HistoryScreen
```

## Design System

Brutalist-leaning dark fitness aesthetic. Lime accent `#c8ff00` on near-black
`#0d0d0f`. Bebas Neue for display/numbers, DM Sans for body, DM Mono for
labels/metrics.

Component styling lives as hand-tuned classes in [src/index.css](src/index.css)
(ported verbatim from the original single-file build — pixel-perfect, don't
rewrite without reason). Design tokens are also exposed to Tailwind v4 via
`@theme`, so prefer Tailwind utilities (`bg-bg3`, `text-accent`,
`font-display`) for **new** layout/spacing work.

## Key Conventions

- Functional components + hooks only.
- Mutate app data exclusively through `useFitlogData`'s `update()`.
- Use `crypto.randomUUID()` for ids (exercises, sets, meals, sessions).
- Keep domain logic in `lib/fitlog.js` pure (no React/Firebase) so it stays
  trivially testable.
- The working set of `exercises`/`meals` auto-resets each calendar day
  (`freshDay` in `lib/fitlog.js`); `history` and `streak` persist.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel — it auto-detects Vite.
2. Add the `VITE_FIREBASE_*` env vars.
3. After first deploy, add the `*.vercel.app` domain to **Firebase Console →
   Authentication → Settings → Authorized domains**, or Google sign-in is
   rejected on the live URL.

## Roadmap

- [x] Workout + food logging, history, streak, PWA, cloud sync, volume chart
- [ ] Body-weight log + weight-over-time chart
- [ ] Workout templates
- [ ] Per-exercise progress history
```
