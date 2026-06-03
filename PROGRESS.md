# FitLog — Build Progress

Tracking doc for making every tab fully functional. Check items off as they land.

**Legend:** ✅ done · 🟡 in progress · ⬜ not started

---

## Decisions (locked in)

| Topic | Decision |
|---|---|
| Bottom nav | Fixed floating glass bar, pinned on all devices; content scrolls under it |
| Testing | Throwaway live account on the real Firebase project (credentials shared privately, kept out of the repo — rotate/delete when done) |
| Score | "Gains Score" → **Consistency Score** (objective, derived from workout consistency) |
| Calorie/macro goal | **Jacob Oestreicher model** — protein is the anchor (0.8–1.0 g/lb bodyweight, adjustable), lean bulk is a small FLAT surplus (not %). Calories = Mifflin–St Jeor TDEE + flat goal delta; fat ~0.9 g/kg; carbs fill the rest |
| Goal types (flat kcal) | Lean Bulk +150 · Bulk +350 · Maintain 0 · Cut −500 |
| Protein anchor | 0.8–1.0 g/lb (default 1.0), user-confirmed as the most important number |
| Settings extras | Build units conversion, real notifications, custom-food creation; remove dead Dark-Mode toggle |

**Architecture rule:** all state changes flow through `useFitlogData`'s `update()` → localStorage cache → Firestore. Keep `lib/fitlog.js` pure (no React/Firebase).

---

## Phase 0 — Foundation ✅

- [x] Make bottom nav sticky (fixed floating glass bar, centered to 480px column)
- [x] Add `--nav-height` token; `<main>` bottom padding so content clears the nav
- [x] Keep docked CTA bars (Log Workout / Add Food) flush above the nav
- [x] Rename **Gains Score → Consistency Score** (label + comments + CLAUDE.md)

_Files: `index.css`, `BottomTabBar.jsx`, `App.jsx`, `preview/PreviewApp.jsx`, `ExerciseScreen.jsx`, `NutritionScreen.jsx`, `ScoreRing.jsx`, `ArcGauge.jsx`, `DashboardScreen.jsx`._

---

## Phase 1 — Profile & body metrics ✅

- [x] Add `profile { sex, age, heightCm, weightKg, activityLevel }` to `emptyState()` (+ `ACTIVITY_LEVELS`, `emptyProfile`, `profileComplete`)
- [x] Profile editor (BottomSheet) in Settings, wired through `update()`
- [x] Show real height/weight on Dashboard `StatPill`s
- [x] Show real `sex | age | weight` on Settings profile card
- [x] Feed real body weight into cardio calorie calc (replace hardcoded 70 kg)
- [x] Cache now merges `emptyState()` defaults so older docs gain new fields safely

**Verified:** edited profile (182 cm / 67 kg / active) on the live test account → updated Dashboard + Settings instantly → cleared local cache + reloaded → profile re-hydrated from **Firestore**. ✅

_Files: `lib/fitlog.js`, `hooks/useFitlogData.js`, `screens/SettingsScreen.jsx`, `screens/DashboardScreen.jsx`, `screens/ExerciseScreen.jsx`, `preview/mockState.js`._

---

## Phase 2 — Goals + macro engine ✅

- [x] Add `goal { type, targetWeightKg, proteinPerLb }` to `emptyState()` (+ `GOAL_TYPES`, `emptyGoal`)
- [x] Pure `computeNutritionTargets(profile, goal)` + `bmrMifflin()` in `lib/fitlog.js`:
  - BMR (Mifflin–St Jeor) → TDEE (activity factor) → **flat** goal delta
  - **Protein anchor 0.8–1.0 g/lb** (Jacob Oestreicher) · Fat ~0.9 g/kg · Carbs = remaining kcal
- [x] Goal picker sheet in Settings (type + target weight + protein g/lb stepper) with **live targets preview**
- [x] Replace hardcoded `CALORIE_GOAL = 2400` in Dashboard + Nutrition with derived target
- [x] Real macro targets drive the Nutrition gauge + Dashboard intake % (consumed/target shown)
- [x] Real weight-to-goal notice on Dashboard (current weight vs target)
- [x] Protein g/lb is user-adjustable (0.8–1.0). _Full manual calorie override deferred — not needed yet._

**Verified live (182 cm / 67 kg / male / 25 / moderate, Lean Bulk, 1.0 g/lb):** TDEE 2616 → **2766 kcal**, **P 148 · C 409 · F 60**. Switching to Cut → 2116 kcal with protein held at 148. Saved + reflected on Dashboard ("5 kg to gain to reach 72 kg goal"). ✅

_Files: `lib/fitlog.js`, `screens/SettingsScreen.jsx`, `screens/DashboardScreen.jsx`, `screens/NutritionScreen.jsx`, `preview/mockState.js`._

---

## Phase 3 — Body-weight log ⬜

- [ ] Add `weightLog: [{ id, date, kg }]` to `emptyState()`
- [ ] Quick "log weight" entry (Settings, and/or Dashboard)
- [ ] Real Settings weight-history rows (replace mock `78.5 kg (-0.2kg)`)
- [ ] Dashboard weight delta / trend from the log
- [ ] Latest logged weight feeds profile/TDEE automatically

**Done when:** logging weight updates history + Dashboard trend and recalculates targets.

---

## Phase 4 — Consistency Score (real formula) ⬜

- [ ] Pure `consistencyScore(state)` in `lib/fitlog.js` (from active days, streak, recovery, goal adherence)
- [ ] Real trend line in `ScoreRing` (replace hardcoded polyline) + real `delta`
- [ ] Wire into Dashboard (replace hardcoded `88`)

**Note:** weighting is subjective — confirm what should move it most before finalizing.

**Done when:** the score reflects actual logged activity and changes as you train.

---

## Phase 5 — Extras / polish ⬜

- [ ] **Units conversion** — kg/cm ↔ lb/in, persisted and applied everywhere
- [ ] **Custom food creation** — UI to add/save user foods into `customFoods`
- [ ] **Notifications** — real PWA reminder notifications behind the toggle
- [ ] **Remove Dark-Mode toggle** — app is dark-only by design
- [ ] **Workout duration timer** — replace `duration: 0` on logged sessions
- [ ] (Optional) editable `sessionName`; real bell/notifications feed

---

## Phase 6 — Security hardening ⬜

Audit summary — **already solid:** Firestore rules scope read/write to the owner's `/users/{uid}` subtree · `.env` gitignored, only the public Firebase web config ships, no admin SDK / service-account in the repo · React auto-escapes and there's no `dangerouslySetInnerHTML` in app code (no XSS sink) · HTTPS via Vercel.

**Gaps to close, by priority:**

### Tier 1 — critical, low effort
- [ ] **Firestore rules validation** — current rules let an authed user write *anything* (any shape/size) to their own doc. Add type checks, field allow-list, and a doc-size guard in `firestore.rules`.
- [ ] **Email-verified gate** — require `request.auth.token.email_verified == true` in rules so unverified sign-ups can't read/write data.
- [ ] **Security headers** in `vercel.json` — CSP (limit `script/connect/img` to self + `*.googleapis.com`/`*.firebaseio.com`/`*.gstatic.com`), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`.
- [ ] **Reproducible rule deploys** — add `firebase.json` + `.firebaserc` so `firestore.rules` deploys via CLI (no manual console drift).
- [ ] **Fix auth enumeration leak** — `SignIn` distinguishes "no account" vs "wrong password"; collapse to a generic message **and** enable Firebase Auth *email-enumeration protection*.

### Tier 2 — important
- [ ] **Firebase App Check** (reCAPTCHA v3 / Enterprise) so the public API key can't be abused outside the real app; enforce on Firestore + Auth.
- [ ] **Email verification flow** — send verification on sign-up, gate data access until verified.
- [ ] **Password policy** — enable Firebase Auth stronger-password policy; reflect min rules in the sign-up UI.
- [ ] **Account deletion + data export** — delete Auth user *and* Firestore doc; export JSON (privacy/GDPR). Re-auth before destructive actions.
- [ ] **Doc-size strategy** — entire state lives in one 1 MB-capped doc; cap/trim `history`/`meals` or plan a subcollection migration to avoid hitting the limit or doc-bloat abuse.

### Tier 3 — ongoing / ops
- [ ] **Authorized domains** review (only prod domain + localhost) in Firebase Auth.
- [ ] **Dependency hygiene** — `npm audit` in CI + Dependabot/Renovate.
- [ ] **Budgets & abuse alerts** — GCP billing budget + Firestore/Auth usage alerts; audit logging.
- [ ] **Service-worker cache review** — vite-plugin-pwa precaches same-origin only; never cache auth/Firestore responses.
- [ ] (Optional) **MFA / blocking functions** — block disposable-email domains, optional TOTP MFA.

**Done when:** rules reject malformed/oversized/unverified writes, App Check is enforced, headers score well on securityheaders.com, and there's a tested account-deletion path.

---

## Open questions / blockers

- ✅ ~~Testing creds~~ — throwaway account created (credentials shared privately, not committed); real auth + sync verified.
- ❓ Consistency Score weighting (Phase 4) — what should matter most?
- ❓ Security: should I start with **Tier 1** quick wins now (rules validation + headers + firebase.json)? App Check (Tier 2) needs a reCAPTCHA key from your Firebase console.
