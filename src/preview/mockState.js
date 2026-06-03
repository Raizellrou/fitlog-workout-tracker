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
    profile: { sex: 'male', age: 28, heightCm: 180, weightKg: 78.5, activityLevel: 'moderate' },
    goal: { type: 'lean_bulk', targetWeightKg: 82, proteinPerLb: 1.0 },
  };
}
