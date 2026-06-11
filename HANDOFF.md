# Session Handoff — FitLog

> Quick-start context for the next session. For deep detail see **`CLAUDE.md`** (architecture)
> and **`PROGRESS.md`** (phase tracker). This file = "where we left off + what's next."

_Last session: 2026-06-03_

---

## TL;DR — start here

Phases 0–2 are **done, verified live, and pushed to `master`** (deployed on Vercel).
The next planned work is **Phase 3 — body-weight log**. Everything is functional through
goal-driven macros. Read `PROGRESS.md` for the full checklist.

---

## What shipped this session

- **Sticky bottom nav** — `BottomTabBar` is now `fixed bottom-0`, centered to the 480px
  column, `z-40`, glass; `<main>` carries `padding-bottom: var(--nav-height)` so content
  clears it. Docked CTA bars (Log Workout / Add Food) sit just above it.
- **Gains Score → Consistency Score** rename (label only; value `88` is still mocked → Phase 4).
- **Phase 1 — Profile**: `profile { sex, age, heightCm, weightKg, activityLevel }` in state;
  editable via a `ProfileSheet` in Settings; real Dashboard pills, Settings card, cardio weight.
- **Phase 2 — Goals + macro engine**: `goal { type, targetWeightKg, proteinPerLb }` +
  `computeNutritionTargets(profile, goal)` in `lib/fitlog.js`. Goal picker sheet with a live
  preview. Replaced the hardcoded `2400` everywhere; real intake % + weight-to-goal notice.
- **Infra**: cache now merges `emptyState()` defaults; Claude tooling gitignored.

Git: commits `2381676` (feature) + `6571f87` (cred redaction) on `master`.

---

## The macro model (locked in) — Jacob Oestreicher

- **Protein is THE anchor**: `0.8–1.0 g per lb` of bodyweight (`goal.proteinPerLb`, default 1.0,
  user-adjustable). This is the most important number per the user.
- Calories = Mifflin–St Jeor BMR × activity factor + a **flat** goal delta (NOT a %):
  Lean Bulk **+150** · Bulk **+350** · Maintain **0** · Cut **−500**.
- Fat ≈ `0.9 g/kg`; carbs fill the remaining calories.
- `computeNutritionTargets` returns `null` until `profileComplete(profile)` → screens fall back to 2400.
- Verified example (67 kg, male, 25, moderate, Lean Bulk, 1.0 g/lb): **2766 kcal · P148 C409 F60**.

---

## Conventions to respect (don't break these)

- **All state changes go through `useFitlogData`'s `update(fn)`** → React + localStorage + Firestore.
  Never call Firestore from a component.
- Keep `lib/fitlog.js` and `lib/foodData.js` **pure** (no React/Firebase).
- Add any new state field to `emptyState()` (cache + snapshot both merge over it).
- Use `crypto.randomUUID()` for IDs.
- Screens are built only from `src/components/ui/` primitives — no one-off card/row markup.

---

## How to test

- **Fast UI/logic check (no auth):** dev server → open **`/preview.html`** (mock data, no Firebase).
  `src/preview/mockState.js` has a profile + goal already.
- **Real auth + sync check:** needs a Firebase login. The old throwaway account should be
  **deleted/rotated** (its password leaked into public git history — see below). Ask the user for
  fresh creds, or create a new throwaway via the sign-up form and keep the creds OUT of any
  committed file.
- `npm run lint` is the only automated check (no test runner).

---

## ⚠️ Open action items

1. **Security (do first):** delete or change the password of the test account `qa@fitlog.app` in
   Firebase Console → Authentication. Its password is in commit `2381676` on a **public** repo.
2. **Phase 3 — body-weight log** (next feature): add `weightLog: [{ id, date, kg }]` to
   `emptyState()`; quick "log weight" entry; replace the mock Settings weight row; Dashboard
   weight trend/delta; latest weight should feed profile/TDEE.
3. Later: Phase 4 Consistency Score formula (replace `88`) · Phase 5 extras (units conversion,
   custom-food creation, notifications, remove dead Dark-Mode toggle, workout timer) ·
   Phase 6 security hardening (Tier 1 = Firestore rules validation + headers + firebase.json;
   email-verify gate should be **toggleable**, kept OFF during dev).

---

## Still mocked (not yet wired)

Consistency Score (`88`) · Settings body-weight history row · Dark Mode / Notifications / Units
toggles. All marked `// TODO` in code.
