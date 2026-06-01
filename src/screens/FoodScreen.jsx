import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { MEAL_EMOJIS, MEAL_TYPES, macroTotals } from '@/lib/fitlog';

const EMPTY_MANUAL = { name: '', cal: '', p: '', c: '', f: '' };

// ── Macro preview card (used in both search and macro summary) ──
function MacroCard({ val, label, color }) {
  return (
    <div className="macro-card">
      <div className="macro-val" style={{ color }}>
        {val}
      </div>
      <div className="macro-label">{label}</div>
    </div>
  );
}

export default function FoodScreen({ state, update, formRef }) {
  const { meals } = state;
  const { showToast } = useToast();

  // Search mode state
  const { query, setQuery, results, loading, clearResults } = useFoodSearch();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [grams, setGrams] = useState('');

  // Shared
  const [mode, setMode] = useState('search'); // 'search' | 'manual'
  const [mealType, setMealType] = useState('Breakfast');

  // Manual mode state
  const [manual, setManual] = useState(EMPTY_MANUAL);

  const totals = macroTotals(meals);

  // ── Live macro preview for search mode ──
  const preview = (() => {
    if (!selectedProduct || !grams) return null;
    const g = parseFloat(grams);
    if (!g || g <= 0) return null;
    const { per100g } = selectedProduct;
    return {
      cal: Math.round((per100g.cal * g) / 100),
      p: Math.round((per100g.p * g) / 100 * 10) / 10,
      c: Math.round((per100g.c * g) / 100 * 10) / 10,
      f: Math.round((per100g.f * g) / 100 * 10) / 10,
    };
  })();

  // ── Add food (search mode) ──
  const addFromSearch = () => {
    if (!selectedProduct) { showToast('Select a food first'); return; }
    const g = parseFloat(grams);
    if (!g || g <= 0) { showToast('Enter how many grams'); return; }
    const { per100g } = selectedProduct;
    const meal = {
      id: crypto.randomUUID(),
      name: selectedProduct.name,
      grams: g,
      per100g,
      cal: Math.round((per100g.cal * g) / 100),
      p: Math.round((per100g.p * g) / 100 * 10) / 10,
      c: Math.round((per100g.c * g) / 100 * 10) / 10,
      f: Math.round((per100g.f * g) / 100 * 10) / 10,
      type: mealType,
      emoji: MEAL_EMOJIS[mealType],
      source: 'search',
    };
    update((s) => ({ ...s, meals: [...s.meals, meal] }));
    setSelectedProduct(null);
    setGrams('');
    clearResults();
    showToast('Meal logged ✓');
  };

  // ── Add food (manual mode) ──
  const addFromManual = () => {
    const name = manual.name.trim();
    if (!name) { showToast('Enter a food name'); return; }
    const meal = {
      id: crypto.randomUUID(),
      name,
      grams: null,
      per100g: null,
      cal: parseFloat(manual.cal) || 0,
      p: parseFloat(manual.p) || 0,
      c: parseFloat(manual.c) || 0,
      f: parseFloat(manual.f) || 0,
      type: mealType,
      emoji: MEAL_EMOJIS[mealType],
      source: 'manual',
    };
    update((s) => ({ ...s, meals: [...s.meals, meal] }));
    setManual(EMPTY_MANUAL);
    showToast('Meal logged ✓');
  };

  const addFood = mode === 'search' ? addFromSearch : addFromManual;

  // Expose to parent CTA button
  if (formRef) formRef.current = addFood;

  const deleteFood = (id) =>
    update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));

  return (
    <div>
      {/* ── Daily macro totals ── */}
      <div className="macro-row">
        <MacroCard val={Math.round(totals.cal)} label="kcal"    color="var(--accent)" />
        <MacroCard val={`${Math.round(totals.p)}g`} label="Protein" color="#60b8ff" />
        <MacroCard val={`${Math.round(totals.c)}g`} label="Carbs"   color="#ffaa40" />
        <MacroCard val={`${Math.round(totals.f)}g`} label="Fats"    color="#ff6b9d" />
      </div>

      {/* ── Log food section ── */}
      <div className="food-section">
        <div className="food-section-title">Log food</div>
        <div className="add-food-form">

          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-toggle-btn${mode === 'search' ? ' active' : ''}`}
              onClick={() => setMode('search')}
            >
              🔍 Search food
            </button>
            <button
              className={`mode-toggle-btn${mode === 'manual' ? ' active' : ''}`}
              onClick={() => setMode('manual')}
            >
              ✏️ Manual entry
            </button>
          </div>

          {/* Meal type picker (shared) */}
          <div className="meal-type-row">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                className={`meal-type-btn${mealType === type ? ' active' : ''}`}
                onClick={() => setMealType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* ── SEARCH MODE ── */}
          {mode === 'search' && (
            <>
              {/* Search input + dropdown */}
              {!selectedProduct && (
                <div className="search-wrap">
                  <input
                    className="field-input"
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="Search food (e.g. chicken breast, rice…)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {(loading || results.length > 0) && (
                    <div className="search-results">
                      {loading && (
                        <div className="search-loading">Searching…</div>
                      )}
                      {!loading &&
                        results.map((product, i) => (
                          <div
                            key={i}
                            className="search-result-item"
                            onClick={() => {
                              setSelectedProduct(product);
                              clearResults();
                            }}
                          >
                            <span className="search-result-name">
                              {product.name}
                            </span>
                            <span className="search-result-cal">
                              {product.per100g.cal} kcal/100g
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected product + grams input */}
              {selectedProduct && (
                <>
                  <div className="selected-product">
                    <span className="selected-product-name">
                      {selectedProduct.name}
                    </span>
                    <button
                      className="del-btn"
                      onClick={() => { setSelectedProduct(null); setGrams(''); }}
                      title="Choose a different food"
                    >
                      ✕
                    </button>
                  </div>

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

                  {/* Live macro preview */}
                  {preview ? (
                    <div className="macro-preview">
                      <div className="macro-preview-cell">
                        <div className="macro-preview-val" style={{ color: 'var(--accent)' }}>
                          {preview.cal}
                        </div>
                        <div className="macro-preview-label">kcal</div>
                      </div>
                      <div className="macro-preview-cell">
                        <div className="macro-preview-val" style={{ color: '#60b8ff' }}>
                          {preview.p}g
                        </div>
                        <div className="macro-preview-label">protein</div>
                      </div>
                      <div className="macro-preview-cell">
                        <div className="macro-preview-val" style={{ color: '#ffaa40' }}>
                          {preview.c}g
                        </div>
                        <div className="macro-preview-label">carbs</div>
                      </div>
                      <div className="macro-preview-cell">
                        <div className="macro-preview-val" style={{ color: '#ff6b9d' }}>
                          {preview.f}g
                        </div>
                        <div className="macro-preview-label">fats</div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--text3)',
                        textAlign: 'center',
                        padding: '8px 0',
                      }}
                    >
                      Per 100g: {selectedProduct.per100g.cal} kcal ·{' '}
                      P {selectedProduct.per100g.p}g · C {selectedProduct.per100g.c}g ·{' '}
                      F {selectedProduct.per100g.f}g
                    </div>
                  )}
                </>
              )}

              {/* No results hint */}
              {!loading && query.trim().length >= 2 && results.length === 0 && !selectedProduct && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text3)',
                    textAlign: 'center',
                    padding: '8px 0',
                  }}
                >
                  No results — try manual entry
                </div>
              )}
            </>
          )}

          {/* ── MANUAL MODE ── */}
          {mode === 'manual' && (
            <div className="form-grid">
              <div className="form-field full">
                <div className="field-label">Food name</div>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. Homemade adobo"
                  value={manual.name}
                  onChange={(e) => setManual((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <div className="field-label">Calories</div>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={manual.cal}
                  onChange={(e) => setManual((f) => ({ ...f, cal: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <div className="field-label">Protein (g)</div>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={manual.p}
                  onChange={(e) => setManual((f) => ({ ...f, p: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <div className="field-label">Carbs (g)</div>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={manual.c}
                  onChange={(e) => setManual((f) => ({ ...f, c: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <div className="field-label">Fats (g)</div>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={manual.f}
                  onChange={(e) => setManual((f) => ({ ...f, f: e.target.value }))}
                />
              </div>
            </div>
          )}

          <button
            className="cta-btn secondary"
            onClick={addFood}
            style={{ marginTop: 12 }}
          >
            + Log this food
          </button>
        </div>
      </div>

      {/* ── Today's meals ── */}
      <div className="food-section">
        <div className="food-section-title">Today&apos;s meals</div>
        {meals.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No meals yet"
            sub="Search a food or use manual entry to start tracking."
          />
        ) : (
          meals.map((m) => (
            <div className="meal-item" key={m.id}>
              <span className="meal-icon">{m.emoji}</span>
              <div className="meal-info">
                <div className="meal-name">{m.name}</div>
                <div className="meal-macros">
                  {m.type}
                  {m.grams ? ` · ${m.grams}g` : ''}
                  {' · '}P:{Math.round(m.p)}g C:{Math.round(m.c)}g F:{Math.round(m.f)}g
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="meal-cal">{Math.round(m.cal)}</div>
                <button className="del-btn" onClick={() => deleteFood(m.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
