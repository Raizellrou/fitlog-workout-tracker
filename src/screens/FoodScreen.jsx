import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';
import { MEAL_EMOJIS, MEAL_TYPES, macroTotals } from '@/lib/fitlog';

const EMPTY_FORM = { name: '', cal: '', p: '', c: '', f: '' };

export default function FoodScreen({ state, update, formRef }) {
  const { meals } = state;
  const { showToast } = useToast();
  const [mealType, setMealType] = useState('Breakfast');
  const [form, setForm] = useState(EMPTY_FORM);

  const totals = macroTotals(meals);
  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addFood = () => {
    const name = form.name.trim();
    if (!name) {
      showToast('Enter a food name');
      return;
    }
    const meal = {
      id: crypto.randomUUID(),
      name,
      cal: parseFloat(form.cal) || 0,
      p: parseFloat(form.p) || 0,
      c: parseFloat(form.c) || 0,
      f: parseFloat(form.f) || 0,
      type: mealType,
      emoji: MEAL_EMOJIS[mealType],
    };
    update((s) => ({ ...s, meals: [...s.meals, meal] }));
    setForm(EMPTY_FORM);
    showToast('Meal logged ✓');
  };

  // Expose addFood to the parent CTA button.
  if (formRef) formRef.current = addFood;

  const deleteFood = (id) =>
    update((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));

  return (
    <div>
      <div className="macro-row">
        <div className="macro-card">
          <div className="macro-val" style={{ color: 'var(--accent)' }}>
            {Math.round(totals.cal)}
          </div>
          <div className="macro-label">kcal</div>
        </div>
        <div className="macro-card">
          <div className="macro-val" style={{ color: '#60b8ff' }}>
            {Math.round(totals.p)}g
          </div>
          <div className="macro-label">Protein</div>
        </div>
        <div className="macro-card">
          <div className="macro-val" style={{ color: '#ffaa40' }}>
            {Math.round(totals.c)}g
          </div>
          <div className="macro-label">Carbs</div>
        </div>
        <div className="macro-card">
          <div className="macro-val" style={{ color: '#ff6b9d' }}>
            {Math.round(totals.f)}g
          </div>
          <div className="macro-label">Fats</div>
        </div>
      </div>

      <div className="food-section">
        <div className="food-section-title">Log food</div>
        <div className="add-food-form">
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
          <div className="form-grid">
            <div className="form-field full">
              <div className="field-label">Food name</div>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Chicken breast"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
            <div className="form-field">
              <div className="field-label">Calories</div>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.cal}
                onChange={(e) => setField('cal', e.target.value)}
              />
            </div>
            <div className="form-field">
              <div className="field-label">Protein (g)</div>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.p}
                onChange={(e) => setField('p', e.target.value)}
              />
            </div>
            <div className="form-field">
              <div className="field-label">Carbs (g)</div>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.c}
                onChange={(e) => setField('c', e.target.value)}
              />
            </div>
            <div className="form-field">
              <div className="field-label">Fats (g)</div>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.f}
                onChange={(e) => setField('f', e.target.value)}
              />
            </div>
          </div>
          <button className="cta-btn secondary" onClick={addFood}>
            + Log this food
          </button>
        </div>
      </div>

      <div className="food-section">
        <div className="food-section-title">Today&apos;s meals</div>
        {meals.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No meals yet"
            sub="Log your first meal above to track your nutrition."
          />
        ) : (
          meals.map((m) => (
            <div className="meal-item" key={m.id}>
              <span className="meal-icon">{m.emoji}</span>
              <div className="meal-info">
                <div className="meal-name">{m.name}</div>
                <div className="meal-macros">
                  {m.type} · P:{Math.round(m.p)}g C:{Math.round(m.c)}g F:
                  {Math.round(m.f)}g
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
