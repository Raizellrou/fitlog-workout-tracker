# FitLog — Personal Fitness Tracking System: Build Plan

A single-user daily tracker covering three areas: meal/nutrition logging,
strength workout tracking with recovery guidance, and cardio/sports logging.

---

## 1. Summary

**Problem.** You want one simple app you can open every day to (a) log meals and
get accurate, auto-calculated macros, (b) log strength workouts and see which
muscle groups are still recovering vs. ready to train again, and (c) log cardio
and sports sessions. Accuracy of the macro math and recovery math is the part
that has to be right.

**Goal.** Ship a responsive web app (works on phone + desktop) backed by a local
food/macro table and an exercise→muscle-group map, with a recovery dashboard
driven by a per-muscle cooldown window of up to 48h.

**Assumptions I'm making (you left these blank — flagging, not stopping):**

- **Platform = both, delivered as one responsive web app / PWA.** A
  phone-installable PWA gives you a native-feeling icon on your phone while
  staying a single codebase that also works on desktop. No app store needed.
- **Stack = match your existing `fitlog-workout` repo.** If it's already a web
  app (the name suggests so), I align to whatever it uses. If it's effectively
  greenfield, my default recommendation is in §5.
- **Single user, no login.** No auth in v1; the app is yours and runs against
  your own data store. (Add auth only if you ever host it publicly.)
- **Macro basis = per 100 g**, the nutrition-label standard. You enter grams,
  the app scales from there.
- **Recovery default = 48 h for all muscle groups**, individually tunable later
  (small muscles often recover faster).

**Questions worth answering before/early in the build (defaults chosen so you
don't have to answer now):**

1. Do you weigh food **cooked or raw**? This materially changes macros (see
   Risks). Default: store foods on a *cooked, as-eaten* basis where possible.
2. Should **secondary** muscles (e.g. triceps during shoulder press) trigger a
   full cooldown, a partial one, or none? Default: half-length cooldown.
3. Do you want **sets/reps/weight** in v1 or just "which exercises I did"?
   Default: just the exercise list in v1; sets/reps deferred.

---

## 2. Scope

### In scope for v1 (the usable product)

- Local **food table** seeded with the staples you actually eat + ability to add
  **custom foods**.
- **Food variants** (e.g. egg: whole / white / yolk), each with its own macros.
- **Meal logging**: create a meal, add foods, enter grams → auto macros per
  item, per meal, and **per day**.
- **Workout session logging**: pick/enter the exercises you did.
- **Exercise → muscle-group mapping** (primary + secondary).
- **Recovery dashboard**: each muscle group shows ready vs. resting + time left,
  using the 48 h cooldown.
- **Cardio logging**: runs/jogs in km with optional time → auto pace (min/km).
- **Sports logging**: e.g. pickleball, with duration/notes.
- **Local data store** + a one-tap **backup/export**.

### Deferred to later

- Barcode scanning and live nutrition-API lookups.
- Sets/reps/weight, PRs, progressive-overload tracking and charts.
- Volume-/intensity-aware recovery (sets done → longer cooldown).
- Macro/calorie **goals and targets** with progress bars.
- Trends, weekly summaries, body-weight tracking.
- Multi-device sync, accounts/auth, cloud backup.
- HealthKit / Google Fit / GPS run tracking.

---

## 3. Core components

| Component | Responsibility |
|---|---|
| **Food & Meal module** | Owns foods, variants, and their per-100 g macros. Scales macros to entered grams, totals a meal, and totals a day. |
| **Workout + Recovery engine** | Owns exercises, the exercise→muscle-group map, and workout sessions. Derives the set of muscle groups trained per session and computes each group's ready/resting status. This is the differentiating part. |
| **Cardio/Sports module** | Owns activity sessions (run/jog with distance/time→pace; sports with duration). Same logging pattern as workouts. |
| **Data store** | Single local database holding all of the above plus a backup/export path. |
| **UI shell** | Responsive web/PWA: a daily dashboard plus dedicated pages for Meals, Workout, Recovery, and Cardio. Optimised for fast daily phone entry. |
| **Seed/reference data** | The curated food table and the exercise→muscle map shipped with the app and editable in-app. |

---

## 4. Data & flow

### Key entities (conceptual schema)

- **Food** — `id, name, category, is_custom`
- **FoodVariant** — `id, food_id, label (e.g. "whole"/"white"/"yolk"),
  kcal_per_100g, protein_per_100g, carb_per_100g, fat_per_100g`
  *(a food with no real variants still gets one "default" variant — keeps the
  math uniform).*
- **Meal** — `id, date, name (breakfast/lunch/…), logged_at`
- **MealItem** — `id, meal_id, food_variant_id, grams`
- **MuscleGroup** — `id, name (chest, side delts, lats, biceps, triceps, …),
  default_cooldown_hours (≤48)`
- **Exercise** — `id, name`
- **ExerciseMuscle** — `exercise_id, muscle_group_id, role (primary|secondary)`
- **WorkoutSession** — `id, logged_at, name (e.g. "Upper day")`
- **WorkoutEntry** — `id, session_id, exercise_id` *(+ optional sets/reps/weight
  later)*
- **CardioSession** — `id, logged_at, type (run|jog|sport), distance_km?,
  duration_min?, pace_min_per_km? (computed), notes?`

### Macro flow (meals)

```
pick Food → pick FoodVariant → enter grams
   item macros = grams × (per_100g / 100)        e.g. 150 g chicken
meal total     = Σ item macros                    (kcal, protein, carb, fat)
day total      = Σ meal totals for that date
```

### Recovery flow (the important logic)

```
1. Log a WorkoutSession with its exercises.
2. For each exercise, look up ExerciseMuscle rows → the muscle groups it trains.
   - PRIMARY muscles get the full cooldown.
   - SECONDARY muscles get a partial cooldown (default ½, tunable).
3. For each muscle group, find the most recent session that trained it:
       last_trained_at
4. ready_at = last_trained_at + cooldown_hours        (cooldown ≤ 48h)
5. Status at "now":
       now ≥ ready_at  →  READY      (rested, safe to train)
       now <  ready_at →  RESTING    (show hours/percent remaining)
6. Dashboard renders every muscle group as READY or RESTING with a progress bar
   = elapsed / cooldown, so you see at a glance what's free today.
```

**Worked example** — your "Upper day" (cable lateral raises, shoulder press,
reverse pec deck, pec deck, incline Smith press, pull-ups, Kelso shrugs, JM
press, bicep curl, single-arm tricep extension, hammer curl, lat pullover) maps
roughly to: side delts, front delts, rear delts, chest, traps/upper back, lats,
biceps, triceps, forearms. After logging it, all of those flip to **RESTING**
for ~48 h, while legs (quads/hams/glutes/calves) and abs stay **READY**. Two
days later the upper-body groups flip back to **READY**.

---

## 5. Tech choices

If your repo already commits to a stack, **keep it** and slot these ideas in.
For a clean default, single-person, accuracy-first build:

| Concern | Recommendation | Why (one line) |
|---|---|---|
| App framework | **Next.js + TypeScript** (or SvelteKit) | One codebase for UI + API, deploys as a PWA, great mobile DX. |
| Styling | **Tailwind CSS** | Fast to build dense, mobile-friendly logging screens. |
| Data store | **SQLite** (file-based) | A single user's data fits comfortably; zero-ops, fast, easy to back up by copying one file. |
| DB access | **Prisma** or **Drizzle** ORM | Typed schema + migrations keep the macro/recovery math honest. |
| Hosting | **Local / a small VPS / Vercel+Turso** | Single user; if you want phone access anywhere, host SQLite via Turso/libSQL. |
| Food/macro data | **Local curated table, seeded from USDA FoodData Central** | You eat ~50–100 foods on repeat; a local table is accurate, instant, offline, and free — far better than hitting an API every meal. |
| Optional macro import | **USDA FoodData Central API** (import-and-cache only) | Use it to *bootstrap* new foods into your local table, not at log time. |
| Recovery/macro logic | **Plain TypeScript service modules + unit tests** | Pure functions are easy to test, which is exactly where accuracy must hold. |

**On the food database specifically:** don't depend on a live nutrition API for
daily logging. Commercial APIs (Nutritionix, Edamam) cost money and add
latency/quotas; crowd-sourced ones (Open Food Facts) vary in quality. For one
person, seed a **local table** from USDA FoodData Central (free, authoritative,
per-100 g) for your staples, add custom foods by hand, and optionally use the
USDA API only as a one-off "import this food" helper. Accurate, fast, offline.

---

## 6. Build phases (ship incrementally)

- **Phase 0 — Scaffold & schema.** Set up the app shell, DB, migrations, and the
  entity schema from §4. Seed the muscle-group list and the exercise→muscle map.

- **Phase 1 — Food data.** Seed the local food table with your staples
  (rice, chicken, eggs incl. variants, …). Add the "create custom food" screen.

- **Phase 2 — Meal logging end-to-end → 🚦 FIRST USABLE VERSION.** Create a
  meal, add foods, enter grams, see item/meal/day macro totals. At this point
  the nutrition half is genuinely usable daily.

- **Phase 3 — Workout + recovery → ⭐ CORE COMPLETE.** Log a session by entering
  exercises; derive muscle groups; build the recovery dashboard (ready vs.
  resting, 48 h). This is the feature that makes the app yours.

- **Phase 4 — Cardio & sports.** Run/jog logging in km with auto pace; sports
  (pickleball) logging with duration/notes. Now all three areas work — **the
  full v1 is done and usable.**

- **Phase 5 — Polish.** Unified daily dashboard, PWA install + offline, one-tap
  backup/export, small UX cleanups. Then pull from the deferred list as wanted.

Earliest usable slice: **end of Phase 2.** Complete intended v1: **end of
Phase 4.**

---

## 7. Risks & open questions

1. **Exercise→muscle mapping accuracy & upkeep.** The recovery feature is only as
   good as the map. *Mitigation:* ship a curated map for your exercises, mark
   primary vs. secondary, and make mappings **editable in-app** so you can fix
   them as you add movements.

2. **Recovery is a heuristic, not physiology.** A flat 48 h ignores volume,
   intensity, and individual recovery. It can say "ready" when you're not.
   *Mitigation:* treat it as guidance; make the window per-muscle tunable; defer
   volume-aware logic to later.

3. **Cooked vs. raw food weight — the #1 macro-accuracy trap.** 100 g of *raw*
   rice ≠ 100 g of *cooked* rice. Pick one basis per food and be consistent, or
   you'll silently miscount calories. *Decision needed:* default to "as eaten /
   cooked" and label each food's basis.

4. **Macro data sourcing.** Brand/preparation variation means no table is
   perfectly "true." *Mitigation:* USDA seed for staples + editable custom
   foods; accept small error rather than chasing a perfect API.

5. **Variant modeling.** Variants add UI/data complexity (egg whole/white/yolk).
   *Mitigation:* model every food as having ≥1 variant ("default") so the code
   path is uniform.

6. **Single-file SQLite data loss.** Your whole history is one file.
   *Mitigation:* build the export/backup early (Phase 5, or sooner) and copy it
   somewhere safe.

7. **Scope creep.** Sets/reps, charts, goals, and sync are all tempting.
   *Mitigation:* they're explicitly deferred above — finish Phases 0–4 first.

8. **Hosting vs. phone access.** Local-only is simplest but won't sync to your
   phone away from home. *Decision needed:* local-only, or host (Turso/VPS) for
   anywhere-access — affects the data-store choice in §5.
