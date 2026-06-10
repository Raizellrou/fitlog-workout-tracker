import { useState } from 'react';
import { Coffee, Salad, Fish, Apple, Search, X, Trash2, PlusCircle } from 'lucide-react';
import AppScreen from '@/components/ui/AppScreen';
import TopBar from '@/components/ui/TopBar';
import Card from '@/components/ui/Card';
import ListRow from '@/components/ui/ListRow';
import MacroRow from '@/components/ui/MacroRow';
import ArcGauge from '@/components/ui/ArcGauge';
import BottomSheet from '@/components/ui/BottomSheet';
import FAB from '@/components/ui/FAB';
import { useToast } from '@/context/ToastContext';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import {
  MEAL_TYPES,
  macroTotals,
  mealMacros,
  macroPercents,
  scaleMacros,
  makeMeal,
  computeNutritionTargets,
} from '@/lib/fitlog';

const MEAL_ICON = {
  Breakfast: Coffee,
  Lunch: Salad,
  Dinner: Fish,
  Snack: Apple,
};

function MealIcon({ type, className }) {
  const Icon = MEAL_ICON[type] ?? Salad;
  return <Icon className={className} strokeWidth={1.9} />;
}

// ── Create Custom Food sheet ────────────────────────────────────────────────
function CreateFoodSheet({ seedName, onClose, onSave }) {
  const { showToast } = useToast();
  const [name, setName] = useState(seedName ?? '');
  const [cal, setCal] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const save = () => {
    if (!name.trim()) return showToast('Enter a food name');
    const calories = parseFloat(cal);
    if (!calories || calories <= 0) return showToast('Enter calories per 100g');
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      custom: true,
      variants: [{
        label: 'default',
        per100g: {
          cal: calories,
          p: parseFloat(p) || 0,
          c: parseFloat(c) || 0,
          f: parseFloat(f) || 0,
        },
      }],
    });
  };

  const macroFields = [
    ['Calories', cal, setCal, 'kcal'],
    ['Protein',  p,   setP,   'g'],
    ['Carbs',    c,   setC,   'g'],
    ['Fat',      f,   setF,   'g'],
  ];

  return (
    <BottomSheet
      title="Create Custom Food"
      onClose={onClose}
      footer={<GradientButton onClick={save}>Save Food</GradientButton>}
    >
      <label className="block text-[13px] font-medium text-muted mb-2">Food name</label>
      <div className="rounded-xl bg-surface-2 border border-white/5 px-3.5 mb-5 focus-within:border-accent/50 transition-colors">
        <input
          className="w-full bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-faint"
          placeholder="e.g. Greek Yogurt"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <label className="block text-[13px] font-medium text-muted mb-2">Macros per 100g</label>
      <div className="grid grid-cols-2 gap-3">
        {macroFields.map(([label, val, setter, unit]) => (
          <div key={label}>
            <span className="block text-[11px] text-muted mb-1.5">{label}</span>
            <div className="flex items-center rounded-xl bg-surface-2 border border-white/5 px-2.5 focus-within:border-accent/50 transition-colors">
              <input
                className="w-full min-w-0 bg-transparent py-3 text-[15px] text-ink outline-none tnum"
                type="number" min="0" inputMode="decimal" placeholder="0"
                value={val}
                onChange={(e) => setter(e.target.value)}
              />
              <span className="text-xs text-faint pl-1">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-faint mt-4">
        Saved foods appear in search and sync across your devices.
      </p>
    </BottomSheet>
  );
}

// ── Add Meal bottom sheet ───────────────────────────────────────────────────
function AddMealSheet({ onClose, onSave, customFoods, onRequestCreateFood }) {
  const { showToast } = useToast();
  const [mealType, setMealType] = useState('Breakfast');
  const [foods, setFoods] = useState([]);

  const { query, setQuery, results, clearResults } = useFoodSearch(customFoods);
  const [selected, setSelected] = useState(null);
  const [variant, setVariant] = useState(null);
  const [grams, setGrams] = useState('');

  const preview = (() => {
    if (!variant || !grams) return null;
    const g = parseFloat(grams);
    return g > 0 ? scaleMacros(variant.per100g, g) : null;
  })();

  const pick = (food) => {
    setSelected(food);
    setVariant(food.variants[0]);
    setGrams('');
    clearResults();
  };

  const addItem = () => {
    if (!selected || !variant) return showToast('Select a food');
    const g = parseFloat(grams);
    if (!g || g <= 0) return showToast('Enter grams');
    const suffix = variant.label !== 'default' ? ` (${variant.label})` : '';
    setFoods((a) => [
      ...a,
      {
        id: crypto.randomUUID(),
        name: selected.name + suffix,
        grams: g,
        foodId: selected.id,
        variantLabel: variant.label,
        ...scaleMacros(variant.per100g, g),
      },
    ]);
    setSelected(null);
    setVariant(null);
    setGrams('');
  };

  const total = mealMacros({ foods });

  const save = () => {
    if (!foods.length) return showToast('Add at least one food');
    onSave(mealType, foods);
  };

  return (
    <BottomSheet
      title="Add Meal"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full bg-surface-2 border border-white/8 text-muted font-semibold py-3.5">
            Cancel
          </button>
          <button onClick={save} className="flex-[2] accent-gradient glow-accent text-white font-semibold py-3.5 rounded-full active:scale-[0.98] transition-transform">
            Save Meal
          </button>
        </div>
      }
    >
        {/* Meal type */}
        <div className="flex gap-2 mb-4">
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              className={`flex-1 py-2.5 rounded-full text-[13px] font-medium transition-colors ${
                mealType === t ? 'accent-gradient text-white' : 'bg-surface-2 border border-white/5 text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Staged foods */}
        {foods.length > 0 && (
          <div className="rounded-2xl bg-surface-2 border border-white/5 px-3 mb-4">
            {foods.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{f.name}</div>
                  <div className="text-[11px] text-muted tnum">
                    {f.grams ? `${f.grams}g · ` : ''}P{Math.round(f.p)} C{Math.round(f.c)} F{Math.round(f.f)}
                  </div>
                </div>
                <span className="text-sm font-semibold text-accent tnum">{Math.round(f.cal)}</span>
                <button onClick={() => setFoods((a) => a.filter((x) => x.id !== f.id))} className="text-faint" aria-label="Remove">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between py-2.5 border-t border-white/10">
              <span className="text-[11px] uppercase tracking-wide text-muted">Meal total</span>
              <span className="text-[18px] font-bold text-accent tnum">{Math.round(total.cal)} kcal</span>
            </div>
          </div>
        )}

        {/* Food picker */}
        <div className="rounded-2xl border border-dashed border-white/12 p-4">
          {!selected ? (
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-white/5 px-3">
                <Search className="w-4 h-4 text-faint shrink-0" strokeWidth={2} />
                <input
                  className="w-full bg-transparent py-2.5 text-[15px] text-ink outline-none placeholder:text-faint"
                  placeholder="Search a food…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              {(results.length > 0 || query.trim().length > 0) && (
                <div className="mt-2 rounded-xl bg-surface-2 border border-white/10 overflow-hidden max-h-56 overflow-y-auto no-scrollbar">
                  {results.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => pick(food)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left border-b border-white/5 last:border-0 active:bg-white/5"
                    >
                      <span className="text-sm text-ink truncate">{food.name}</span>
                      <span className="text-[11px] text-muted shrink-0 tnum">{food.variants[0].per100g.cal} kcal/100g</span>
                    </button>
                  ))}
                  {/* Create custom food shortcut */}
                  <button
                    onClick={() => onRequestCreateFood(query.trim())}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left border-t border-white/5 text-accent-light active:bg-white/5"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span className="text-sm">
                      {query.trim() ? `Create "${query.trim()}"` : 'Create custom food'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-accent-soft border border-accent/25 px-3 py-2.5 mb-3">
                <span className="text-sm font-medium text-accent-light truncate">{selected.name}</span>
                <button onClick={() => setSelected(null)} className="text-faint" aria-label="Clear">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {selected.variants.length > 1 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {selected.variants.map((v) => (
                    <button
                      key={v.label}
                      onClick={() => { setVariant(v); setGrams(''); }}
                      className={`px-3 py-1.5 rounded-full text-[12px] ${
                        variant?.label === v.label ? 'accent-gradient text-white' : 'bg-surface-2 border border-white/5 text-muted'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              <input
                className="w-full rounded-xl bg-surface-2 border border-white/5 px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-faint mb-3 focus:border-accent/50"
                type="number"
                min="1"
                placeholder="Grams (e.g. 150)"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                autoFocus
              />

              {preview && (
                <div className="grid grid-cols-4 gap-2 mb-3 tnum">
                  {[
                    ['kcal', preview.cal, 'text-accent-light'],
                    ['P', `${preview.p}g`, 'text-ink'],
                    ['C', `${preview.c}g`, 'text-ink'],
                    ['F', `${preview.f}g`, 'text-ink'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="rounded-lg bg-surface-2 py-2 text-center">
                      <div className={`text-[15px] font-bold ${c}`}>{v}</div>
                      <div className="text-[10px] text-muted uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={addItem} className="w-full rounded-full bg-surface-2 border border-accent/30 text-accent-light font-semibold py-2.5 text-sm active:scale-[0.99] transition-transform">
                + Add to meal
              </button>
            </>
          )}
        </div>
    </BottomSheet>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────────
export default function NutritionScreen({ state, update }) {
  const { meals, customFoods = [] } = state;
  const { showToast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createFoodOpen, setCreateFoodOpen] = useState(false);
  const [createFoodSeed, setCreateFoodSeed] = useState('');

  const totals = macroTotals(meals);
  const pct = macroPercents(totals);
  const targets = computeNutritionTargets(state.profile, state.goal);
  const calorieGoal = targets?.calories ?? 2400;

  const saveMeal = (type, foods) => {
    update((s) => ({ ...s, meals: [...s.meals, { ...makeMeal(type), foods }] }));
    setSheetOpen(false);
    showToast('Meal logged ✓');
  };
  const deleteMeal = (id) => update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));

  const handleRequestCreateFood = (seedName) => {
    setSheetOpen(false);
    setCreateFoodSeed(seedName);
    setCreateFoodOpen(true);
  };

  const saveCustomFood = (food) => {
    update((s) => ({ ...s, customFoods: [...(s.customFoods ?? []), food] }));
    setCreateFoodOpen(false);
    showToast('Custom food saved ✓');
  };

  return (
    <>
      <AppScreen className="pb-2">
        <TopBar title="Nutrition" variant="centered" />

        {/* Calorie card */}
        <Card className="mb-5">
          <ArcGauge value={Math.round(totals.cal)} max={calorieGoal} goalLabel={`${calorieGoal.toLocaleString()} Goal`} />
          <div className="h-px bg-white/8 my-5" />
          <div className="text-[13px] font-medium text-muted mb-3">Macro Breakdown</div>
          {/* Stacked P/C/F bar */}
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-white/8 mb-4">
            <span style={{ width: `${pct.p}%`, background: 'var(--color-accent-deep)' }} />
            <span style={{ width: `${pct.c}%`, background: 'var(--color-accent)' }} />
            <span style={{ width: `${pct.f}%`, background: 'var(--color-accent-light)' }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MacroRow color="var(--color-accent-deep)" label="Protein" value={`${pct.p}%`} />
            <MacroRow color="var(--color-accent)" label="Carbs" value={`${pct.c}%`} />
            <MacroRow color="var(--color-accent-light)" label="Fats" value={`${pct.f}%`} />
          </div>
          <div className="text-xs text-muted text-center mt-4 tnum">
            {targets
              ? `P ${Math.round(totals.p)}/${targets.protein}g · C ${Math.round(totals.c)}/${targets.carbs}g · F ${Math.round(totals.f)}/${targets.fat}g`
              : `P:${Math.round(totals.p)}g · C:${Math.round(totals.c)}g · F:${Math.round(totals.f)}g`}
          </div>
        </Card>

        {/* Today's meals */}
        <h2 className="text-[18px] font-semibold text-ink mb-3">Today&apos;s Meals</h2>
        {meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
            <div className="text-muted text-sm">No meals yet — tap + to log food.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {meals.map((m) => {
              const mm = mealMacros(m);
              const sub = (m.foods ?? []).map((f) => f.name).join(', ') || m.type;
              return (
                <ListRow
                  key={m.id}
                  icon={<MealIcon type={m.type} className="w-5 h-5" />}
                  title={m.type}
                  subtitle={sub}
                  trailing={
                    <>
                      <span className="text-sm text-muted tnum">({Math.round(mm.cal)} kcal)</span>
                      <button onClick={() => deleteMeal(m.id)} className="text-faint hover:text-danger" aria-label="Delete meal">
                        <Trash2 className="w-4 h-4" strokeWidth={1.9} />
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </AppScreen>

      {/* Docked Add Food bar — sits just above the fixed bottom nav (main's bottom padding lifts it clear) */}
      <div className="sticky bottom-0 z-10 px-5 pt-2 pb-3 bg-base/85 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink shrink-0">Add Food</span>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex items-center gap-2 rounded-full bg-surface-2 border border-white/8 px-3.5 py-2.5 text-left"
          >
            <Search className="w-4 h-4 text-faint" strokeWidth={2} />
            <span className="text-sm text-faint">Search</span>
          </button>
          <FAB onClick={() => setSheetOpen(true)} label="Add food" />
        </div>
      </div>

      {sheetOpen && (
        <AddMealSheet
          customFoods={customFoods}
          onClose={() => setSheetOpen(false)}
          onSave={saveMeal}
          onRequestCreateFood={handleRequestCreateFood}
        />
      )}
      {createFoodOpen && (
        <CreateFoodSheet
          seedName={createFoodSeed}
          onClose={() => setCreateFoodOpen(false)}
          onSave={saveCustomFood}
        />
      )}
    </>
  );
}
