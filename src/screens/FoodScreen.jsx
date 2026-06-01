import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import {
  MEAL_EMOJIS,
  MEAL_TYPES,
  macroTotals,
  mealMacros,
  scaleMacros,
  makeMeal,
} from '@/lib/fitlog';

// ── Top macro summary card ──
function MacroCard({ val, label, color }) {
  return (
    <div className="macro-card">
      <div className="macro-val" style={{ color }}>{val}</div>
      <div className="macro-label">{label}</div>
    </div>
  );
}

const EMPTY_MANUAL = { name: '', grams: '', cal: '', p: '', c: '', f: '' };

// ─────────────────────────────────────────────────────────────────────────────
// Add Meal modal — pick a meal type, then add one or more foods to it.
// ─────────────────────────────────────────────────────────────────────────────
function AddMealModal({ onClose, onSave, customFoods }) {
  const { showToast } = useToast();

  const [mealType, setMealType] = useState('Breakfast');
  const [foods, setFoods] = useState([]); // food items staged for this meal

  // Food picker state
  const { query, setQuery, results, clearResults } = useFoodSearch(customFoods);
  const [selectedFood, setSelectedFood] = useState(null);
  const [variant, setVariant] = useState(null);
  const [grams, setGrams] = useState('');

  // Manual-entry fallback (foods not in the database)
  const [manual, setManual] = useState(null); // null = closed, else EMPTY_MANUAL shape

  const preview = (() => {
    if (!variant || !grams) return null;
    const g = parseFloat(grams);
    if (!g || g <= 0) return null;
    return scaleMacros(variant.per100g, g);
  })();

  const pickFood = (food) => {
    setSelectedFood(food);
    setVariant(food.variants[0]);
    setGrams('');
    clearResults();
  };

  const resetPicker = () => {
    setSelectedFood(null);
    setVariant(null);
    setGrams('');
  };

  // Add a database food (scaled by grams) to the staged meal
  const addFoodItem = () => {
    if (!selectedFood || !variant) { showToast('Select a food'); return; }
    const g = parseFloat(grams);
    if (!g || g <= 0) { showToast('Enter grams'); return; }
    const suffix = variant.label !== 'default' ? ` (${variant.label})` : '';
    setFoods((arr) => [
      ...arr,
      {
        id: crypto.randomUUID(),
        name: selectedFood.name + suffix,
        grams: g,
        foodId: selectedFood.id,
        variantLabel: variant.label,
        ...scaleMacros(variant.per100g, g),
      },
    ]);
    resetPicker();
  };

  // Add a manual food (macros entered directly) to the staged meal
  const addManualItem = () => {
    const name = manual.name.trim();
    if (!name) { showToast('Enter a food name'); return; }
    setFoods((arr) => [
      ...arr,
      {
        id: crypto.randomUUID(),
        name,
        grams: parseFloat(manual.grams) || null,
        foodId: null,
        variantLabel: null,
        cal: parseFloat(manual.cal) || 0,
        p: parseFloat(manual.p) || 0,
        c: parseFloat(manual.c) || 0,
        f: parseFloat(manual.f) || 0,
      },
    ]);
    setManual(null);
  };

  const removeFoodItem = (id) =>
    setFoods((arr) => arr.filter((f) => f.id !== id));

  const total = mealMacros({ foods });

  const save = () => {
    if (foods.length === 0) { showToast('Add at least one food'); return; }
    onSave(mealType, foods);
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxHeight: '88vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="modal-header">
          <div className="modal-title">Add Meal</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Meal type */}
        <div className="meal-type-row">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              className={`meal-type-btn${mealType === type ? ' active' : ''}`}
              onClick={() => setMealType(type)}
            >
              {MEAL_EMOJIS[type]} {type}
            </button>
          ))}
        </div>

        {/* Staged foods list */}
        {foods.length > 0 && (
          <div className="staged-foods">
            {foods.map((f) => (
              <div className="staged-food-row" key={f.id}>
                <div className="staged-food-main">
                  <span className="staged-food-name">{f.name}</span>
                  <span className="staged-food-sub">
                    {f.grams ? `${f.grams}g · ` : ''}
                    P{Math.round(f.p)} C{Math.round(f.c)} F{Math.round(f.f)}
                  </span>
                </div>
                <span className="staged-food-cal">{Math.round(f.cal)}</span>
                <button className="del-btn" onClick={() => removeFoodItem(f.id)}>✕</button>
              </div>
            ))}
            <div className="staged-total">
              <span>Meal total</span>
              <span className="staged-total-val">{Math.round(total.cal)} kcal</span>
            </div>
          </div>
        )}

        {/* ── Food picker ── */}
        {!manual && (
          <div className="food-builder">
            {!selectedFood ? (
              <>
                <div className="search-wrap">
                  <input
                    className="field-input"
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="Search a food (e.g. chicken breast, rice…)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {results.length > 0 && (
                    <div className="search-results">
                      {results.map((food) => (
                        <div
                          key={food.id}
                          className="search-result-item"
                          onClick={() => pickFood(food)}
                        >
                          <span className="search-result-name">{food.name}</span>
                          <span className="search-result-cal">
                            {food.variants[0].per100g.cal} kcal/100g
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {query.trim().length >= 2 && results.length === 0 && (
                  <div className="picker-hint">
                    Not in the list —{' '}
                    <button className="link-btn" onClick={() => setManual({ ...EMPTY_MANUAL, name: query })}>
                      enter it manually
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="selected-product">
                  <span className="selected-product-name">{selectedFood.name}</span>
                  <button className="del-btn" onClick={resetPicker} title="Choose a different food">✕</button>
                </div>

                {/* Variant pills (only when >1 exists) */}
                {selectedFood.variants.length > 1 && (
                  <div className="meal-type-row" style={{ marginBottom: 8 }}>
                    {selectedFood.variants.map((v) => (
                      <button
                        key={v.label}
                        className={`meal-type-btn${variant?.label === v.label ? ' active' : ''}`}
                        onClick={() => { setVariant(v); setGrams(''); }}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="form-field" style={{ marginBottom: 10 }}>
                  <div className="field-label">How many grams?</div>
                  <input
                    className="field-input"
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    autoFocus
                  />
                </div>

                {preview ? (
                  <div className="macro-preview">
                    <div className="macro-preview-cell">
                      <div className="macro-preview-val" style={{ color: 'var(--accent)' }}>{preview.cal}</div>
                      <div className="macro-preview-label">kcal</div>
                    </div>
                    <div className="macro-preview-cell">
                      <div className="macro-preview-val" style={{ color: '#60b8ff' }}>{preview.p}g</div>
                      <div className="macro-preview-label">protein</div>
                    </div>
                    <div className="macro-preview-cell">
                      <div className="macro-preview-val" style={{ color: '#ffaa40' }}>{preview.c}g</div>
                      <div className="macro-preview-label">carbs</div>
                    </div>
                    <div className="macro-preview-cell">
                      <div className="macro-preview-val" style={{ color: '#ff6b9d' }}>{preview.f}g</div>
                      <div className="macro-preview-label">fats</div>
                    </div>
                  </div>
                ) : (
                  <div className="picker-hint" style={{ textAlign: 'center' }}>
                    {variant && (
                      <>Per 100g: {variant.per100g.cal} kcal · P {variant.per100g.p} · C {variant.per100g.c} · F {variant.per100g.f}</>
                    )}
                  </div>
                )}

                <button className="cta-btn secondary" style={{ marginTop: 10 }} onClick={addFoodItem}>
                  + Add to meal
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Manual entry fallback ── */}
        {manual && (
          <div className="food-builder">
            <div className="form-grid">
              <div className="form-field full">
                <div className="field-label">Food name</div>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Homemade adobo"
                  value={manual.name}
                  autoFocus
                  onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <div className="field-label">Grams (optional)</div>
                <input className="field-input" type="number" min="0" placeholder="—"
                  value={manual.grams}
                  onChange={(e) => setManual((m) => ({ ...m, grams: e.target.value }))} />
              </div>
              <div className="form-field">
                <div className="field-label">Calories</div>
                <input className="field-input" type="number" min="0" placeholder="0"
                  value={manual.cal}
                  onChange={(e) => setManual((m) => ({ ...m, cal: e.target.value }))} />
              </div>
              <div className="form-field">
                <div className="field-label">Protein (g)</div>
                <input className="field-input" type="number" min="0" placeholder="0"
                  value={manual.p}
                  onChange={(e) => setManual((m) => ({ ...m, p: e.target.value }))} />
              </div>
              <div className="form-field">
                <div className="field-label">Carbs (g)</div>
                <input className="field-input" type="number" min="0" placeholder="0"
                  value={manual.c}
                  onChange={(e) => setManual((m) => ({ ...m, c: e.target.value }))} />
              </div>
              <div className="form-field">
                <div className="field-label">Fats (g)</div>
                <input className="field-input" type="number" min="0" placeholder="0"
                  value={manual.f}
                  onChange={(e) => setManual((m) => ({ ...m, f: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="cta-btn secondary" style={{ flex: 1, opacity: 0.75 }}
                onClick={() => setManual(null)}>
                Back
              </button>
              <button className="cta-btn secondary" style={{ flex: 2 }} onClick={addManualItem}>
                + Add to meal
              </button>
            </div>
          </div>
        )}

        {/* ── Modal actions ── */}
        <div className="modal-actions">
          <button className="cta-btn secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="cta-btn" style={{ flex: 2 }} onClick={save}>
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FoodScreen({ state, update }) {
  const { meals, customFoods = [] } = state;
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const totals = macroTotals(meals);

  const saveMeal = (type, foods) => {
    const meal = { ...makeMeal(type), foods };
    update((s) => ({ ...s, meals: [...s.meals, meal] }));
    setModalOpen(false);
    showToast('Meal logged ✓');
  };

  const deleteMeal = (id) =>
    update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));

  return (
    <div>
      {/* ── Today's macro totals ── */}
      <div className="macro-row">
        <MacroCard val={Math.round(totals.cal)}     label="kcal"    color="var(--accent)" />
        <MacroCard val={`${Math.round(totals.p)}g`} label="Protein" color="#60b8ff" />
        <MacroCard val={`${Math.round(totals.c)}g`} label="Carbs"   color="#ffaa40" />
        <MacroCard val={`${Math.round(totals.f)}g`} label="Fats"    color="#ff6b9d" />
      </div>

      {/* ── Today's meals ── */}
      <div className="food-section">
        <div className="food-section-title">Today&apos;s meals</div>
        {meals.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No meals yet"
            sub='Tap "Add meal" to log your food and auto-calculate macros.'
          />
        ) : (
          meals.map((m) => {
            const mm = mealMacros(m);
            return (
              <div className="meal-card" key={m.id}>
                <div className="meal-card-head">
                  <span className="meal-icon">{m.emoji}</span>
                  <span className="meal-card-type">{m.type}</span>
                  <span className="meal-card-total">{Math.round(mm.cal)} kcal</span>
                  <button className="del-btn" onClick={() => deleteMeal(m.id)}>✕</button>
                </div>
                <div className="meal-card-foods">
                  {(m.foods ?? []).map((f) => (
                    <div className="meal-food-row" key={f.id}>
                      <span className="meal-food-name">{f.name}</span>
                      <span className="meal-food-sub">
                        {f.grams ? `${f.grams}g` : ''}
                      </span>
                      <span className="meal-food-cal">{Math.round(f.cal)}</span>
                    </div>
                  ))}
                </div>
                <div className="meal-card-macros">
                  P {Math.round(mm.p)}g · C {Math.round(mm.c)}g · F {Math.round(mm.f)}g
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add meal button ── */}
      <button className="add-exercise-btn" onClick={() => setModalOpen(true)}>
        <span style={{ fontSize: 18 }}>+</span> Add meal
      </button>

      {modalOpen && (
        <AddMealModal
          customFoods={customFoods}
          onClose={() => setModalOpen(false)}
          onSave={saveMeal}
        />
      )}
    </div>
  );
}
