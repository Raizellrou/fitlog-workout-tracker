# FitLog Feature Expansion — Progress Tracker

## Phase 1 — Delete with Confirmation ✅
- [x] Create `ConfirmSheet` component (`src/components/ui/ConfirmSheet.jsx`)
- [x] Wire exercise delete through ConfirmSheet (`ExerciseScreen.jsx`)
- [x] Add cardio session delete with ConfirmSheet (`ExerciseScreen.jsx`)
- [x] Wire meal delete through ConfirmSheet (`NutritionScreen.jsx`)

## Phase 2 — Custom Meal Templates ✅
- [x] Add `mealTemplates` to `emptyState()` (`lib/fitlog.js`)
- [x] Add `makeMealTemplate()` factory (`lib/fitlog.js`)
- [x] Add `mealTemplates` to Firestore rules + trim guard
- [x] "Save as Template" button on logged meals (`NutritionScreen.jsx`)
- [x] "From Template" picker in `AddMealSheet` (`NutritionScreen.jsx`)
- [x] Template delete in AddMealSheet template list

## Phase 3 — Custom Exercise Templates ✅
- [x] Add `exerciseTemplates` to `emptyState()` (`lib/fitlog.js`)
- [x] Add `makeExerciseTemplate()` + `exerciseFromTemplate()` factories (`lib/fitlog.js`)
- [x] Add `exerciseTemplates` to Firestore rules + trim guard
- [x] "Save as Template" bookmark button in exercise editor (`ExerciseScreen.jsx`)
- [x] Template picker sheet when adding exercise — shows templates + "Start from Scratch"
- [x] Template delete from picker sheet

## Phase 4 — Workout Splits ✅
- [x] Add `workoutSplits`, `activeSplitId` to `emptyState()` (`lib/fitlog.js`)
- [x] Add `makeSplit()`, `splitDayForToday()`, `exercisesFromSplitDay()` + helpers (`lib/fitlog.js`)
- [x] Add to Firestore rules + trim guard (`firestore.rules`, `useFitlogData.js`)
- [x] Split editor sheet — create/edit/delete splits, assign exercises per day
- [x] Split-aware Exercise tab — auto-populate from active split
- [x] Rest day card UI with next workout info
- [x] Split manager/selector/activator UI

## Phase 5 — Consistency Score Revamp ✅
- [x] Add `mealDays` to `emptyState()` (`lib/fitlog.js`)
- [x] Track meal days on meal save (`NutritionScreen.jsx`)
- [x] Rewrite `consistencyScore()` — 6 components + decay (`lib/fitlog.js`)
- [x] Update `consistencyTrend()` (`lib/fitlog.js`)
- [x] Add `mealDays` to Firestore rules
- [x] Verify Dashboard ScoreRing displays updated score

## Phase 6 — Username + Public Profile ✅
- [x] Add `username`, `displayName` to `emptyState()` (`lib/fitlog.js`)
- [x] Create `usePublicProfile` hook (`src/hooks/usePublicProfile.js`)
- [x] `usernames/{username}` collection + Firestore rules
- [x] `publicProfiles/{uid}` collection + Firestore rules
- [x] Username/display name editor in Settings
- [x] Onboarding prompt for new users
- [x] Real-time username availability check

## Phase 7 — Friends System
- [ ] Create `useFriends` hook (`src/hooks/useFriends.js`)
- [ ] Create `useFriendScores` hook (`src/hooks/useFriendScores.js`)
- [ ] `friendRequests` collection + Firestore rules
- [ ] `publicProfiles/{uid}/friends` subcollection + rules
- [ ] Username search + send friend request UI
- [ ] Pending requests — accept/decline UI
- [ ] Friend list management (remove friend)

## Phase 8 — Ranking Tab + Push Notifications
- [ ] Create `RankingScreen.jsx` (`src/screens/RankingScreen.jsx`)
- [ ] Add 5th tab to `BottomTabBar` + `App.jsx` routing
- [ ] Leaderboard UI — rank, avatar, name, score, streak
- [ ] Add Friend FAB + username search sheet
- [ ] Pending requests banner
- [ ] Empty state UI
- [ ] FCM setup — client token registration
- [ ] Cloud Function — score change trigger + push notification
- [ ] Cloud Function — daily inactivity reminder
