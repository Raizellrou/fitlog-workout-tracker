// Curated food database — USDA FoodData Central per-100g values (cooked/as-eaten basis).
// Every food has ≥1 variant so the macro-scaling path is uniform.
// Add custom foods at runtime via state.customFoods (synced to Firestore).

export const FOODS = [
  // ── PROTEIN ──────────────────────────────────────────────────────────────
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 165, p: 31.0, c: 0, f: 3.6 } }],
  },
  {
    id: 'chicken-thigh',
    name: 'Chicken Thigh',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 209, p: 26.0, c: 0, f: 10.9 } }],
  },
  {
    id: 'egg',
    name: 'Egg',
    category: 'protein',
    variants: [
      { label: 'whole',  per100g: { cal: 143, p: 12.6, c: 0.7, f: 9.5 } },
      { label: 'white',  per100g: { cal: 52,  p: 10.9, c: 0.7, f: 0.2 } },
      { label: 'yolk',   per100g: { cal: 322, p: 15.9, c: 3.6, f: 26.5 } },
    ],
  },
  {
    id: 'ground-beef',
    name: 'Ground Beef',
    category: 'protein',
    variants: [
      { label: '80/20', per100g: { cal: 254, p: 17.2, c: 0, f: 20.0 } },
      { label: '90/10', per100g: { cal: 196, p: 20.3, c: 0, f: 12.5 } },
    ],
  },
  {
    id: 'beef-steak',
    name: 'Beef Steak',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 271, p: 26.1, c: 0, f: 17.7 } }],
  },
  {
    id: 'pork-tenderloin',
    name: 'Pork Tenderloin',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 143, p: 26.2, c: 0, f: 3.5 } }],
  },
  {
    id: 'pork-belly',
    name: 'Pork Belly',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 518, p: 9.3, c: 0, f: 53.0 } }],
  },
  {
    id: 'tuna',
    name: 'Tuna',
    category: 'protein',
    variants: [
      { label: 'canned in water', per100g: { cal: 116, p: 25.5, c: 0, f: 0.8 } },
      { label: 'fresh/cooked',    per100g: { cal: 184, p: 29.9, c: 0, f: 6.3 } },
    ],
  },
  {
    id: 'salmon',
    name: 'Salmon',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 208, p: 20.4, c: 0, f: 13.4 } }],
  },
  {
    id: 'tilapia',
    name: 'Tilapia',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 128, p: 26.2, c: 0, f: 2.7 } }],
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 99, p: 24.0, c: 0.2, f: 0.3 } }],
  },
  {
    id: 'tofu',
    name: 'Tofu',
    category: 'protein',
    variants: [
      { label: 'firm',   per100g: { cal: 76, p: 8.1, c: 1.9, f: 4.2 } },
      { label: 'silken', per100g: { cal: 55, p: 4.8, c: 2.0, f: 2.7 } },
    ],
  },
  {
    id: 'whey-protein',
    name: 'Whey Protein',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 370, p: 80.0, c: 6.0, f: 4.0 } }],
  },
  {
    id: 'casein-protein',
    name: 'Casein Protein',
    category: 'protein',
    variants: [{ label: 'default', per100g: { cal: 360, p: 78.0, c: 5.0, f: 2.0 } }],
  },
  {
    id: 'bacon',
    name: 'Bacon',
    category: 'protein',
    variants: [{ label: 'pan-fried', per100g: { cal: 541, p: 37.0, c: 1.4, f: 42.0 } }],
  },

  // ── CARBS ─────────────────────────────────────────────────────────────────
  {
    id: 'white-rice',
    name: 'White Rice',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 130, p: 2.7, c: 28.2, f: 0.3 } }],
  },
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 123, p: 2.7, c: 25.6, f: 1.0 } }],
  },
  {
    id: 'oats',
    name: 'Oats',
    category: 'carbs',
    variants: [
      { label: 'dry',    per100g: { cal: 389, p: 17.0, c: 66.3, f: 6.9 } },
      { label: 'cooked', per100g: { cal: 71,  p: 2.5,  c: 12.0, f: 1.4 } },
    ],
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'carbs',
    variants: [
      { label: 'baked',  per100g: { cal: 90,  p: 2.0, c: 20.7, f: 0.1 } },
      { label: 'boiled', per100g: { cal: 76,  p: 1.4, c: 17.7, f: 0.1 } },
    ],
  },
  {
    id: 'white-potato',
    name: 'White Potato',
    category: 'carbs',
    variants: [
      { label: 'baked',  per100g: { cal: 93,  p: 2.5, c: 21.1, f: 0.1 } },
      { label: 'boiled', per100g: { cal: 87,  p: 1.9, c: 20.1, f: 0.1 } },
    ],
  },
  {
    id: 'bread',
    name: 'Bread',
    category: 'carbs',
    variants: [
      { label: 'white',      per100g: { cal: 265, p: 9.0,  c: 49.0, f: 3.2 } },
      { label: 'whole wheat', per100g: { cal: 247, p: 13.0, c: 41.0, f: 4.2 } },
    ],
  },
  {
    id: 'pasta',
    name: 'Pasta',
    category: 'carbs',
    variants: [
      { label: 'dry',    per100g: { cal: 358, p: 12.5, c: 71.0, f: 1.5 } },
      { label: 'cooked', per100g: { cal: 158, p: 5.8,  c: 30.9, f: 0.9 } },
    ],
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruit',
    variants: [{ label: 'default', per100g: { cal: 89, p: 1.1, c: 22.8, f: 0.3 } }],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruit',
    variants: [{ label: 'default', per100g: { cal: 52, p: 0.3, c: 13.8, f: 0.2 } }],
  },
  {
    id: 'mango',
    name: 'Mango',
    category: 'fruit',
    variants: [{ label: 'default', per100g: { cal: 60, p: 0.8, c: 15.0, f: 0.4 } }],
  },
  {
    id: 'orange',
    name: 'Orange',
    category: 'fruit',
    variants: [{ label: 'default', per100g: { cal: 47, p: 0.9, c: 11.8, f: 0.1 } }],
  },
  {
    id: 'grapes',
    name: 'Grapes',
    category: 'fruit',
    variants: [{ label: 'default', per100g: { cal: 67, p: 0.6, c: 17.2, f: 0.4 } }],
  },
  {
    id: 'corn',
    name: 'Corn',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 96, p: 3.4, c: 21.0, f: 1.5 } }],
  },

  // ── VEGETABLES ───────────────────────────────────────────────────────────
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'veg',
    variants: [{ label: 'cooked', per100g: { cal: 35, p: 2.4, c: 7.2, f: 0.4 } }],
  },
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'veg',
    variants: [{ label: 'default', per100g: { cal: 23, p: 2.9, c: 3.6, f: 0.4 } }],
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    category: 'veg',
    variants: [{ label: 'default', per100g: { cal: 25, p: 1.3, c: 5.8, f: 0.1 } }],
  },
  {
    id: 'carrot',
    name: 'Carrot',
    category: 'veg',
    variants: [{ label: 'default', per100g: { cal: 41, p: 0.9, c: 9.6, f: 0.2 } }],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    category: 'veg',
    variants: [{ label: 'default', per100g: { cal: 15, p: 0.7, c: 3.6, f: 0.1 } }],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'veg',
    variants: [{ label: 'default', per100g: { cal: 18, p: 0.9, c: 3.9, f: 0.2 } }],
  },

  // ── DAIRY ────────────────────────────────────────────────────────────────
  {
    id: 'milk',
    name: 'Milk',
    category: 'dairy',
    variants: [
      { label: 'whole (3.25%)',  per100g: { cal: 61,  p: 3.2, c: 4.8, f: 3.3 } },
      { label: 'low-fat (1%)',   per100g: { cal: 42,  p: 3.4, c: 5.0, f: 1.0 } },
      { label: 'skim (0%)',      per100g: { cal: 35,  p: 3.4, c: 5.0, f: 0.2 } },
    ],
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    category: 'dairy',
    variants: [
      { label: 'plain 0%',   per100g: { cal: 59,  p: 10.2, c: 3.6, f: 0.4 } },
      { label: 'plain 2%',   per100g: { cal: 73,  p: 9.9,  c: 3.8, f: 1.9 } },
      { label: 'plain full', per100g: { cal: 97,  p: 9.0,  c: 3.9, f: 5.0 } },
    ],
  },
  {
    id: 'cottage-cheese',
    name: 'Cottage Cheese',
    category: 'dairy',
    variants: [
      { label: 'low-fat (1%)', per100g: { cal: 72,  p: 12.4, c: 2.7, f: 1.0 } },
      { label: 'full-fat',     per100g: { cal: 98,  p: 11.1, c: 3.4, f: 4.3 } },
    ],
  },
  {
    id: 'cheddar-cheese',
    name: 'Cheddar Cheese',
    category: 'dairy',
    variants: [{ label: 'default', per100g: { cal: 402, p: 24.9, c: 1.3, f: 33.1 } }],
  },
  {
    id: 'mozzarella',
    name: 'Mozzarella',
    category: 'dairy',
    variants: [{ label: 'default', per100g: { cal: 280, p: 28.1, c: 2.2, f: 17.1 } }],
  },
  {
    id: 'butter',
    name: 'Butter',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 717, p: 0.9, c: 0.1, f: 81.1 } }],
  },

  // ── FATS / NUTS / SEEDS ───────────────────────────────────────────────────
  {
    id: 'olive-oil',
    name: 'Olive Oil',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 884, p: 0, c: 0, f: 100.0 } }],
  },
  {
    id: 'coconut-oil',
    name: 'Coconut Oil',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 862, p: 0, c: 0, f: 100.0 } }],
  },
  {
    id: 'peanut-butter',
    name: 'Peanut Butter',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 588, p: 25.1, c: 20.0, f: 49.9 } }],
  },
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 579, p: 21.2, c: 21.6, f: 49.9 } }],
  },
  {
    id: 'peanuts',
    name: 'Peanuts',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 567, p: 25.8, c: 16.1, f: 49.2 } }],
  },
  {
    id: 'walnuts',
    name: 'Walnuts',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 654, p: 15.2, c: 13.7, f: 65.2 } }],
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 160, p: 2.0, c: 8.5, f: 14.7 } }],
  },
  {
    id: 'chia-seeds',
    name: 'Chia Seeds',
    category: 'fats',
    variants: [{ label: 'default', per100g: { cal: 486, p: 16.5, c: 42.1, f: 30.7 } }],
  },

  // ── LEGUMES ───────────────────────────────────────────────────────────────
  {
    id: 'black-beans',
    name: 'Black Beans',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 132, p: 8.9, c: 23.7, f: 0.5 } }],
  },
  {
    id: 'chickpeas',
    name: 'Chickpeas',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 164, p: 8.9, c: 27.4, f: 2.6 } }],
  },
  {
    id: 'lentils',
    name: 'Lentils',
    category: 'carbs',
    variants: [{ label: 'cooked', per100g: { cal: 116, p: 9.0, c: 20.1, f: 0.4 } }],
  },

  // ── MISC / CONDIMENTS ─────────────────────────────────────────────────────
  {
    id: 'white-sugar',
    name: 'White Sugar',
    category: 'other',
    variants: [{ label: 'default', per100g: { cal: 387, p: 0, c: 99.8, f: 0 } }],
  },
  {
    id: 'honey',
    name: 'Honey',
    category: 'other',
    variants: [{ label: 'default', per100g: { cal: 304, p: 0.3, c: 82.4, f: 0 } }],
  },
  {
    id: 'soy-sauce',
    name: 'Soy Sauce',
    category: 'other',
    variants: [{ label: 'default', per100g: { cal: 60, p: 5.6, c: 5.6, f: 0.1 } }],
  },
];

/** Case-insensitive substring search across FOODS + customFoods. */
export function searchFoods(query, customFoods = []) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const all = [...FOODS, ...customFoods];
  return all.filter((f) => f.name.toLowerCase().includes(q));
}
