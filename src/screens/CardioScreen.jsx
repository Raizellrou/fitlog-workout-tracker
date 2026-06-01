import { useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/context/ToastContext';
import { longDate } from '@/lib/format';
import { CARDIO_TYPES, calcCardio, weeklyCardioStats } from '@/lib/fitlog';

const TODAY = new Date().toISOString().split('T')[0];

const EMPTY_FORM = { type: 'run', distance: '', duration: '', notes: '' };

const TYPE_LABELS = { run: '🏃 Run', jog: '🚶 Jog', walk: '🦶 Walk' };

export default function CardioScreen({ state, update }) {
  const { showToast } = useToast();
  const cardioSessions = state.cardioSessions ?? [];
  const weekStats = weeklyCardioStats(cardioSessions);

  const [form, setForm] = useFormState(EMPTY_FORM);

  // Live preview
  const preview = (() => {
    const d = parseFloat(form.distance);
    const t = parseFloat(form.duration);
    if (!d || !t || d <= 0 || t <= 0) return null;
    return calcCardio({ type: form.type, distanceKm: d, durationMin: t });
  })();

  const addCardio = () => {
    const distanceKm = parseFloat(form.distance);
    const durationMin = parseFloat(form.duration);
    if (!distanceKm || distanceKm <= 0) { showToast('Enter distance in km'); return; }
    if (!durationMin || durationMin <= 0) { showToast('Enter duration in minutes'); return; }

    const { pace, calories } = calcCardio({
      type: form.type,
      distanceKm,
      durationMin,
    });

    const session = {
      id: crypto.randomUUID(),
      date: TODAY,
      type: form.type,
      distanceKm,
      durationMin,
      pace,
      calories,
      notes: form.notes.trim(),
    };

    update((s) => ({
      ...s,
      cardioSessions: [session, ...(s.cardioSessions ?? [])],
    }));
    setForm(EMPTY_FORM);
    showToast('Cardio logged ✓');
  };

  const deleteCardio = (id) =>
    update((s) => ({
      ...s,
      cardioSessions: (s.cardioSessions ?? []).filter((c) => c.id !== id),
    }));

  // Chart data: last 10 sessions oldest → newest
  const chartData = [...cardioSessions]
    .reverse()
    .slice(-10)
    .map((s) => ({
      label: longDate(s.date).split(',')[0],
      km: s.distanceKm,
    }));

  const hasChart = chartData.some((d) => d.km > 0);

  return (
    <div>
      {/* ── Weekly stats ── */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-val">{weekStats.totalKm}</div>
          <div className="stat-label">km / week</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{weekStats.sessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">
            {weekStats.bestPace > 0 ? `${weekStats.bestPace}` : '—'}
          </div>
          <div className="stat-label">Best pace</div>
        </div>
      </div>

      {/* ── Log form ── */}
      <div className="food-section">
        <div className="food-section-title">Log cardio</div>
        <div className="cardio-form">
          {/* Type selector */}
          <div className="cardio-type-row">
            {CARDIO_TYPES.map((t) => (
              <button
                key={t}
                className={`cardio-type-btn${form.type === t ? ' active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Distance + Duration */}
          <div className="form-grid">
            <div className="form-field">
              <div className="field-label">Distance (km)</div>
              <input
                className="field-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 5.0"
                value={form.distance}
                onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <div className="field-label">Duration (min)</div>
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              />
            </div>
            <div className="form-field full">
              <div className="field-label">Notes (optional)</div>
              <textarea
                className="notes-input"
                rows={2}
                placeholder="e.g. Morning jog around the park"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          {/* Live preview */}
          {preview && (
            <div className="cardio-preview">
              <div className="cardio-preview-card">
                <div className="cardio-preview-val">{preview.pace}</div>
                <div className="cardio-preview-label">min / km</div>
              </div>
              <div className="cardio-preview-card">
                <div className="cardio-preview-val">{preview.calories}</div>
                <div className="cardio-preview-label">est. kcal</div>
              </div>
            </div>
          )}

          <button
            className="cta-btn secondary"
            onClick={addCardio}
            style={{ marginTop: 12 }}
          >
            + Log this session
          </button>
        </div>
      </div>

      {/* ── Distance chart ── */}
      {hasChart && (
        <div className="food-section">
          <div className="food-section-title">Distance trend</div>
          <div style={{ height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#606070', fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#242428',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    fontFamily: 'DM Mono',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#9090a0' }}
                  itemStyle={{ color: '#c8ff00' }}
                  formatter={(v) => [`${v} km`, 'Distance']}
                />
                <Line
                  type="monotone"
                  dataKey="km"
                  stroke="#c8ff00"
                  strokeWidth={2}
                  dot={{ fill: '#c8ff00', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Session history ── */}
      <div className="food-section-title" style={{ marginBottom: 14 }}>
        Past sessions
      </div>

      {cardioSessions.length === 0 ? (
        <EmptyState
          icon="🏃"
          title="No cardio logged yet"
          sub="Log your first run, jog, or walk above."
        />
      ) : (
        cardioSessions.map((s) => (
          <div className="cardio-item" key={s.id}>
            <div className="cardio-item-header">
              <div className="cardio-item-left">
                <span className={`cardio-type-badge cardio-type-badge--${s.type}`}>
                  {s.type}
                </span>
                <span className="cardio-item-date">{longDate(s.date)}</span>
              </div>
              <button className="del-btn" onClick={() => deleteCardio(s.id)}>
                ✕
              </button>
            </div>
            <div className="cardio-item-stats">
              <span className="cardio-stat">
                <strong>{s.distanceKm} km</strong>
              </span>
              <span className="cardio-stat">
                <strong>{s.durationMin} min</strong>
              </span>
              {s.pace > 0 && (
                <span className="cardio-stat">
                  <strong>{s.pace}</strong> min/km
                </span>
              )}
              {s.calories > 0 && (
                <span className="cardio-stat">
                  ~<strong>{s.calories}</strong> kcal
                </span>
              )}
            </div>
            {s.notes && <div className="cardio-notes">{s.notes}</div>}
          </div>
        ))
      )}
    </div>
  );
}

// ── Tiny hook to keep form state clean inside the component ──
function useFormState(initial) {
  const [form, setFormRaw] = useState(initial);
  const setForm = (updater) => {
    setFormRaw((prev) =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  };
  return [form, setForm];
}
