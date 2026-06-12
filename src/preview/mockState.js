// TEMP preview-only mock data (not shipped). Mirrors the reference mockups.
import { makeMeal } from '@/lib/fitlog';

export const PREVIEW_TODAY = '2026-06-04'; // Thursday

const meal = (type, name, macros) => ({
  ...makeMeal(type),
  foods: [{ id: crypto.randomUUID(), name, grams: 0, ...macros }],
});

const ex = (name, muscleGroup, weight, sets) => ({
  id: crypto.randomUUID(),
  name,
  muscleGroup,
  sets: Array.from({ length: sets.count }, (_, i) => ({
    weight: String(weight),
    reps: sets.reps,
    done: i < sets.done,
  })),
});

export function previewState() {
  return {
    sessionName: 'Upper Body',
    exercises: [
      ex('Barbell Press', 'chest', 95, { count: 4, reps: '10', done: 4 }),
      ex('Overhead Press', 'chest', 25, { count: 4, reps: '10', done: 2 }),
      ex('Dumbbell Row', 'back', 25, { count: 4, reps: '10', done: 0 }),
      ex('Pull-Ups', 'back', 0, { count: 3, reps: '10', done: 1 }),
    ],
    meals: [
      meal('Breakfast', 'Protein Oats', { cal: 650, p: 45, c: 75, f: 18 }),
      meal('Lunch', 'Chicken Salad', { cal: 550, p: 50, c: 40, f: 22 }),
      meal('Dinner', 'Salmon & Rice', { cal: 750, p: 45, c: 95, f: 45 }),
    ],
    activeDate: PREVIEW_TODAY,
    history: [
      { id: '1', date: '2026-06-01', name: 'Upper Body', exercises: [], duration: 3_900_000, muscleGroups: ['chest', 'back'] },
      { id: '2', date: '2026-06-02', name: 'Lower Body', exercises: [], duration: 4_320_000, muscleGroups: ['legs'] },
      { id: '3', date: '2026-06-03', name: 'Push Day', exercises: [], duration: 3_600_000, muscleGroups: ['chest', 'shoulders'] },
    ],
    streak: 4,
    lastWorkoutDate: '2026-06-03',
    muscleGroupHistory: { chest: '2026-06-03', back: '2026-06-01', legs: '2026-06-02' },
    cardioSessions: [
      { id: 'c1', date: '2026-06-02', type: 'run', distanceKm: 5, durationMin: 26, pace: 5.2, calories: 364, notes: '' },
    ],
    customFoods: [],
    mealTemplates: [
      {
        id: 'mt1', name: 'Chicken & Rice Prep', emoji: '☀️', type: 'Lunch',
        foods: [
          { id: 'mtf1', name: 'Chicken Breast', grams: 200, foodId: 'f1', variantLabel: 'default', cal: 330, p: 62, c: 0, f: 7.2 },
          { id: 'mtf2', name: 'White Rice', grams: 150, foodId: 'f2', variantLabel: 'default', cal: 195, p: 4, c: 43, f: 0.4 },
        ],
      },
    ],
    exerciseTemplates: [
      { id: 'et1', name: 'Bench Press', muscleGroup: 'chest', defaultSets: [{ reps: '10', weight: '80' }, { reps: '10', weight: '80' }, { reps: '8', weight: '85' }, { reps: '6', weight: '90' }] },
      { id: 'et2', name: 'Barbell Squat', muscleGroup: 'legs', defaultSets: [{ reps: '8', weight: '100' }, { reps: '8', weight: '100' }, { reps: '6', weight: '110' }] },
    ],
    workoutSplits: [
      {
        id: 'sp1',
        name: 'Push Pull Legs',
        days: {
          mon: {
            isRest: false, label: 'Push Day',
            exercises: [
              { name: 'Bench Press', muscleGroup: 'chest', defaultSets: [{ reps: '10', weight: '80' }, { reps: '10', weight: '80' }, { reps: '8', weight: '85' }, { reps: '6', weight: '90' }] },
              { name: 'Overhead Press', muscleGroup: 'shoulders', defaultSets: [{ reps: '10', weight: '25' }, { reps: '10', weight: '25' }, { reps: '8', weight: '30' }] },
              { name: 'Tricep Pushdown', muscleGroup: 'triceps', defaultSets: [{ reps: '12', weight: '20' }, { reps: '12', weight: '20' }, { reps: '10', weight: '25' }] },
            ],
          },
          tue: {
            isRest: false, label: 'Pull Day',
            exercises: [
              { name: 'Barbell Row', muscleGroup: 'back', defaultSets: [{ reps: '10', weight: '70' }, { reps: '10', weight: '70' }, { reps: '8', weight: '75' }] },
              { name: 'Pull-Ups', muscleGroup: 'back', defaultSets: [{ reps: '8', weight: '0' }, { reps: '8', weight: '0' }, { reps: '6', weight: '0' }] },
              { name: 'Bicep Curl', muscleGroup: 'biceps', defaultSets: [{ reps: '12', weight: '14' }, { reps: '12', weight: '14' }, { reps: '10', weight: '16' }] },
            ],
          },
          wed: {
            isRest: false, label: 'Leg Day',
            exercises: [
              { name: 'Barbell Squat', muscleGroup: 'legs', defaultSets: [{ reps: '8', weight: '100' }, { reps: '8', weight: '100' }, { reps: '6', weight: '110' }] },
              { name: 'Leg Press', muscleGroup: 'legs', defaultSets: [{ reps: '10', weight: '150' }, { reps: '10', weight: '150' }, { reps: '8', weight: '170' }] },
              { name: 'Calf Raise', muscleGroup: 'calves', defaultSets: [{ reps: '15', weight: '40' }, { reps: '15', weight: '40' }, { reps: '12', weight: '50' }] },
            ],
          },
          thu: { isRest: true, label: 'Rest', exercises: [] },
          fri: {
            isRest: false, label: 'Push Day',
            exercises: [
              { name: 'Bench Press', muscleGroup: 'chest', defaultSets: [{ reps: '10', weight: '80' }, { reps: '10', weight: '80' }, { reps: '8', weight: '85' }] },
              { name: 'Overhead Press', muscleGroup: 'shoulders', defaultSets: [{ reps: '10', weight: '25' }, { reps: '10', weight: '25' }] },
            ],
          },
          sat: {
            isRest: false, label: 'Pull Day',
            exercises: [
              { name: 'Barbell Row', muscleGroup: 'back', defaultSets: [{ reps: '10', weight: '70' }, { reps: '8', weight: '75' }] },
              { name: 'Pull-Ups', muscleGroup: 'back', defaultSets: [{ reps: '8', weight: '0' }, { reps: '6', weight: '0' }] },
            ],
          },
          sun: { isRest: true, label: 'Rest', exercises: [] },
        },
      },
    ],
    activeSplitId: 'sp1',
    mealDays: ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04'],
    username: 'charlesfit',
    displayName: 'Charles',
    profile: { sex: 'male', age: 28, heightCm: 180, weightKg: 78.5, activityLevel: 'moderate' },
    goal: { type: 'lean_bulk', targetWeightKg: 82, proteinPerLb: 1.0 },
  };
}
