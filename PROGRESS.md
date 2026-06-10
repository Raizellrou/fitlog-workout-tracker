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

## Phase 3 — Body-weight log ✅

- [x] Add `weightLog: [{ id, date, kg }]` to `emptyState()`
- [x] Quick "log weight" entry — "Body Weight" section in Settings with a BottomSheet input
- [x] Real Settings weight-history rows (last 4 entries, newest first, each showing kg delta vs previous)
- [x] Dashboard Weight StatPill shows delta vs previous entry (`+0.5 kg` / `-0.3 kg`)
- [x] Latest logged weight auto-updates `profile.weightKg` → TDEE + macro targets recalculate immediately

**Verified:** logging weight appends to `weightLog`, updates `profile.weightKg`, reflects on Dashboard StatPill and weight-to-goal notice. ✅

_Files: `lib/fitlog.js`, `components/ui/StatPill.jsx`, `screens/SettingsScreen.jsx`, `screens/DashboardScreen.jsx`._

---

## Phase 4 — Consistency Score (real formula) ✅

- [x] Pure `consistencyScore(state)` in `lib/fitlog.js` — balanced blend:
  - 50% workout frequency (active days in last 28, ideal = 4/week)
  - 25% current streak (normalised to 30-day ceiling)
  - 15% recovery adherence (no overtrained muscle groups)
  - 10% cardio sessions this week (ideal = 2)
- [x] `consistencyTrend(state, weeks)` — per-week frequency scores (oldest → newest), last entry = full live score
- [x] `ScoreRing` accepts `trendPoints` → real SVG polyline + direction-aware arrow tick; `delta` shows ↑/↓ with colour
- [x] Dashboard wired: replaces hardcoded `88` / `delta={5}` with live score, delta vs previous week, real trend

**Done when:** the score reflects actual logged activity and changes as you train. ✅

_Files: `lib/fitlog.js`, `components/ui/ScoreRing.jsx`, `screens/DashboardScreen.jsx`._

---

## Phase 5 — Extras / polish ✅

- [x] **Remove Dark-Mode toggle** — app is dark-only; row removed from Settings
- [x] **Workout duration timer** — live `⏱ MM:SS` counter in Exercise tab; `duration` saved on session log; persists across tab switches via `sessionStorage`; resets on log
- [x] **Custom food creation** — `CreateFoodSheet` (name + per-100g macros); accessible via "+ Create" in food search dropdown; saves to `state.customFoods` → synced via Firestore; shows up in search immediately
- [x] **Units conversion** — `units: 'metric'|'imperial'` in state; helpers in `format.js` (`kgToLb`, `lbToKg`, `cmToIn`, `inToCm`, `cmToFtIn`); applied to Dashboard StatPills, Settings profile summary, profile/goal/weight-log sheets, weight-to-goal notice; storage stays metric always
- [x] **Notifications** — toggle calls `Notification.requestPermission()`; preference stored in `state.notificationsEnabled`; reminder fires 30s after app load when enabled + no workout logged today (works while tab is open)

_Files: `lib/format.js`, `lib/fitlog.js`, `screens/ExerciseScreen.jsx`, `screens/NutritionScreen.jsx`, `screens/SettingsScreen.jsx`, `screens/DashboardScreen.jsx`, `App.jsx`._

---

## Phase 6 — Security hardening ✅

Audit summary — **already solid:** Firestore rules scope read/write to the owner's `/users/{uid}` subtree · `.env` gitignored, only the public Firebase web config ships, no admin SDK / service-account in the repo · React auto-escapes and there's no `dangerouslySetInnerHTML` in app code (no XSS sink) · HTTPS via Vercel.

**Gaps to close, by priority:**

### Tier 1 — critical, low effort ✅
- [x] **Firestore rules validation** — `firestore.rules` rewritten: only `users/{uid}/data/fitlog` is matched (all other paths denied by default), email-verified gate, top-level field allow-list (15 keys), scalar type checks, array size caps (history ≤ 500, exercises ≤ 50, meals ≤ 20, cardio ≤ 500, weightLog ≤ 365, customFoods ≤ 200).
- [x] **Email-verified gate** — `request.auth.token.email_verified == true` in rules + full UI flow: `sendEmailVerification` on sign-up, `EmailVerification.jsx` screen (resend + reload buttons), `App.jsx` gates behind `user.emailVerified`.
- [x] **Security headers** — `vercel.json` updated: HSTS (2yr + preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, full CSP (`default-src 'self'`, Firebase/Google allowlist for `connect-src`, `frame-ancestors 'none'`).
- [x] **Reproducible rule deploys** — `firebase.json` + `.firebaserc` (project `fitlog-e400e`) + `firestore.indexes.json` added; deploy with `firebase deploy --only firestore:rules`.
- [x] **Fix auth enumeration leak** — `auth/user-not-found` and `auth/wrong-password` now return the same generic message as `auth/invalid-credential`; password placeholder updated to "Min. 8 characters".

### Tier 2 — important (partial) ✅
- [x] **Email verification flow** — covered above (Tier 1 gate + UI).
- [x] **Password policy** — sign-up UI reflects min-8 requirement; Firebase console should be set to enforce ≥8 chars.
- [x] **Account deletion** — `DeleteAccountSheet` in Settings: re-authenticates with password, deletes Firestore doc then Auth user; `deleteAccount(password)` added to `AuthContext`.
- [x] **Doc-size strategy** — `trimForFirestore()` in `useFitlogData.js` caps arrays before every Firestore write (history/cardio ≤ 500, weightLog ≤ 365). Local state is untrimmed for display.
- [ ] **Firebase App Check** — requires reCAPTCHA key from Firebase console; not automated.
- [x] **Data export (JSON)** — "Export My Data" row in Settings; downloads `fitlog-export-YYYY-MM-DD.json` containing the full state blob.

### Tier 3 — ongoing / ops
- [ ] **Authorized domains** review (only prod domain + localhost) in Firebase Auth.
- [ ] **Dependency hygiene** — `npm audit` in CI + Dependabot/Renovate.
- [ ] **Budgets & abuse alerts** — GCP billing budget + Firestore/Auth usage alerts; audit logging.
- [ ] **Service-worker cache review** — vite-plugin-pwa precaches same-origin only; never cache auth/Firestore responses.
- [ ] (Optional) **MFA / blocking functions** — block disposable-email domains, optional TOTP MFA.

**Note for the test account:** if `emailVerified` is currently `false` on the throwaway account, open the app → use the verification screen to resend → click the link → press "I've verified". Alternatively verify via Firebase Console → Authentication → Users.

_Files: `firestore.rules`, `firebase.json`, `.firebaserc`, `firestore.indexes.json`, `vercel.json`, `src/components/SignIn.jsx`, `src/context/AuthContext.jsx`, `src/components/EmailVerification.jsx`, `src/App.jsx`, `src/screens/SettingsScreen.jsx`, `src/hooks/useFitlogData.js`._

---

## Open questions / blockers

- ✅ ~~Testing creds~~ — throwaway account created (credentials shared privately, not committed); real auth + sync verified.
- ✅ ~~Consistency Score weighting~~ — balanced blend: frequency 50%, streak 25%, recovery 15%, cardio 10%.
- ✅ ~~Security Tier 1~~ — all done. App Check (Tier 2) still needs a reCAPTCHA key from the Firebase console.
- ❓ **Firebase App Check** — requires setting up reCAPTCHA Enterprise in Firebase Console, generating a site key, and passing it to `initializeAppCheck()`. Cannot be automated without Console access.
