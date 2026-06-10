import { useState, useEffect } from 'react';
import {
  Dumbbell, ChevronDown, Check, Plus, Trash2, Footprints, Activity, Timer,
} from 'lucide-react';
import AppScreen from '@/components/ui/AppScreen';
import TopBar from '@/components/ui/TopBar';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import BottomSheet from '@/components/ui/BottomSheet';
import DayStreakCell from '@/components/ui/DayStreakCell';
import { useToast } from '@/context/ToastContext';
import { timerLabel } from '@/lib/format';
import {
  makeExercise, makeSet, MUSCLE_GROUPS, detectMuscleGroup,
  extractMuscleGroups, nextStreak, weekGrid,
  CARDIO_TYPES, calcCardio,
} from '@/lib/fitlog';

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Other');

function repRange(sets) {
  const reps = sets.map((s) => parseInt(s.reps, 10)).filter((n) => n > 0);
  if (!reps.length) return null;
  const min = Math.min(...reps);
  const max = Math.max(...reps);
  return min === max ? `${min} Reps` : `${min}-${max} Reps`;
}
const topWeight = (sets) => {
  const w = sets.map((s) => parseFloat(s.weight)).filter((n) => n > 0);
  return w.length ? Math.max(...w) : 0;
};
const allDone = (sets) => sets.length > 0 && sets.every((s) => s.done);

// ── One exercise row (collapsed summary + expandable editor) ────────────────
function ExerciseRow({ ex, expanded, onToggleExpand, update }) {
  const done = allDone(ex.sets);
  const rr = repRange(ex.sets);
  const tw = topWeight(ex.sets);

  const patch = (fn) =>
    update((s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === ex.id ? fn(e) : e)) }));

  const setName = (name) =>
    patch((e) => ({ ...e, name, muscleGroup: e.muscleGroup || detectMuscleGroup(name) }));
  const setGroup = (g) => patch((e) => ({ ...e, muscleGroup: g || null }));
  const addSet = () => patch((e) => ({ ...e, sets: [...e.sets, makeSet(e.sets.at(-1))] }));
  const updSet = (i, field, val) =>
    patch((e) => ({ ...e, sets: e.sets.map((st, idx) => (idx === i ? { ...st, [field]: val } : st)) }));
  const toggleAll = () => patch((e) => ({ ...e, sets: e.sets.map((st) => ({ ...st, done: !done })) }));
  const remove = () => update((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== ex.id) }));

  return (
    <div className="rounded-2xl bg-surface-2 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <button onClick={onToggleExpand} className="grid place-items-center w-10 h-10 rounded-xl bg-accent-soft text-accent shrink-0">
          <Dumbbell className="w-5 h-5" strokeWidth={1.9} />
        </button>
        <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left">
          <div className="text-[15px] font-semibold text-ink truncate">{ex.name || 'New exercise'}</div>
          <div className="text-xs text-muted truncate mt-0.5">
            {ex.sets.length} Sets{rr ? `, ${rr}` : ''}
          </div>
        </button>
        {tw > 0 && <span className="text-sm font-medium text-ink tnum shrink-0">{tw} kg</span>}
        <button
          onClick={toggleAll}
          aria-label="Mark done"
          className={`grid place-items-center w-7 h-7 rounded-lg shrink-0 ${
            done ? 'accent-gradient' : 'bg-surface border border-white/10'
          }`}
        >
          {done && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
        </button>
      </div>

      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-white/5 pt-3 space-y-3">
          <input
            className="w-full rounded-lg bg-surface border border-white/8 px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
            placeholder="Exercise name…"
            value={ex.name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full rounded-lg bg-surface border border-white/8 px-3 py-2 text-sm text-muted outline-none focus:border-accent/50"
            value={ex.muscleGroup ?? ''}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">— muscle group —</option>
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>{titleCase(g)}</option>
            ))}
          </select>

          <div className="space-y-2">
            {ex.sets.map((st, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-faint w-6 tnum">#{i + 1}</span>
                <input
                  className="flex-1 rounded-lg bg-surface border border-white/8 px-2.5 py-2 text-sm text-ink text-center outline-none focus:border-accent/50 tnum"
                  type="number" min="0" placeholder="kg"
                  value={st.weight}
                  onChange={(e) => updSet(i, 'weight', e.target.value)}
                />
                <input
                  className="flex-1 rounded-lg bg-surface border border-white/8 px-2.5 py-2 text-sm text-ink text-center outline-none focus:border-accent/50 tnum"
                  type="number" min="0" placeholder="reps"
                  value={st.reps}
                  onChange={(e) => updSet(i, 'reps', e.target.value)}
                />
                <button
                  onClick={() => updSet(i, 'done', !st.done)}
                  className={`grid place-items-center w-8 h-8 rounded-lg shrink-0 ${st.done ? 'accent-gradient' : 'bg-surface border border-white/10'}`}
                >
                  {st.done && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={addSet} className="flex-1 rounded-full border border-dashed border-white/15 text-faint text-xs py-2 hover:text-accent hover:border-accent/40 transition-colors">
              + add set
            </button>
            <button onClick={remove} aria-label="Delete exercise" className="grid place-items-center w-9 rounded-full border border-white/8 text-faint hover:text-danger">
              <Trash2 className="w-4 h-4" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Cardio sheet ─────────────────────────────────────────────────────────
function AddCardioSheet({ onClose, onSave, bodyWeightKg }) {
  const { showToast } = useToast();
  const [type, setType] = useState('run');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const { pace, calories } = calcCardio({ type, distanceKm, durationMin, weightKg: bodyWeightKg });

  const save = () => {
    const d = parseFloat(distanceKm);
    if (!d || d <= 0) return showToast('Enter distance');
    onSave({ type, distanceKm: d, durationMin: parseFloat(durationMin) || 0, pace, calories });
  };

  return (
    <BottomSheet
      title="Add Cardio"
      onClose={onClose}
      footer={<GradientButton onClick={save}>Save Cardio</GradientButton>}
    >
      <div className="flex gap-2 mb-4">
        {CARDIO_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 rounded-full text-[13px] font-medium capitalize transition-colors ${type === t ? 'accent-gradient text-white' : 'bg-surface-2 border border-white/5 text-muted'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <input className="flex-1 rounded-xl bg-surface-2 border border-white/5 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent/50 tnum" type="number" min="0" placeholder="Distance (km)" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
        <input className="flex-1 rounded-xl bg-surface-2 border border-white/5 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent/50 tnum" type="number" min="0" placeholder="Time (min)" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
      </div>
      {pace > 0 && (
        <div className="grid grid-cols-2 gap-3 tnum">
          <div className="rounded-xl bg-surface-2 py-3.5 text-center">
            <div className="text-[20px] font-bold text-accent-light">{pace}</div>
            <div className="text-[11px] text-muted uppercase tracking-wide mt-0.5">min/km</div>
          </div>
          <div className="rounded-xl bg-surface-2 py-3.5 text-center">
            <div className="text-[20px] font-bold text-accent-light">{calories}</div>
            <div className="text-[11px] text-muted uppercase tracking-wide mt-0.5">kcal</div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function ExerciseScreen({ state, update, today }) {
  const { exercises, cardioSessions = [] } = state;
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [cardioOpen, setCardioOpen] = useState(false);
  const [showCardio, setShowCardio] = useState(false);

  // ── Workout duration timer ─────────────────────────────────────────────────
  // Persisted in sessionStorage so it survives tab switches within the same page load.
  const [startedAt, setStartedAt] = useState(() => {
    if (exercises.length === 0) return null;
    const saved = sessionStorage.getItem('fitlog_workout_start');
    if (saved) return parseInt(saved, 10);
    const t = Date.now();
    sessionStorage.setItem('fitlog_workout_start', String(t));
    return t;
  });
  const [elapsed, setElapsed] = useState(0);

  // Auto-start on first exercise added
  useEffect(() => {
    if (exercises.length > 0 && startedAt === null) {
      const t = Date.now();
      sessionStorage.setItem('fitlog_workout_start', String(t));
      setStartedAt(t);
    }
  }, [exercises.length, startedAt]);

  // Live 1-second tick
  useEffect(() => {
    if (!startedAt) return;
    setElapsed(Date.now() - startedAt);
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const grid = weekGrid(state.history, today);

  // Group exercises by muscle group (preserve insertion order)
  const groups = [];
  const groupIndex = {};
  for (const ex of exercises) {
    const key = ex.muscleGroup || 'other';
    if (!(key in groupIndex)) {
      groupIndex[key] = groups.length;
      groups.push({ key, label: titleCase(ex.muscleGroup), items: [] });
    }
    groups[groupIndex[key]].items.push(ex);
  }

  const addExercise = () => {
    const ex = makeExercise();
    update((s) => ({ ...s, exercises: [...s.exercises, ex] }));
    setExpandedId(ex.id);
  };

  const toggleGroup = (key) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const saveCardio = ({ type, distanceKm, durationMin, pace, calories }) => {
    const session = { id: crypto.randomUUID(), date: today, type, distanceKm, durationMin, pace, calories, notes: '' };
    update((s) => ({ ...s, cardioSessions: [session, ...(s.cardioSessions ?? [])] }));
    setCardioOpen(false);
    setShowCardio(true);
    showToast('Cardio logged ✓');
  };

  const logWorkout = () => {
    if (exercises.length === 0) return showToast('Add an exercise first');
    const name = (state.sessionName || '').trim() || 'Workout';
    const muscleGroups = extractMuscleGroups(exercises);
    const mgUpdates = Object.fromEntries(muscleGroups.map((g) => [g, today]));
    const duration = startedAt ? Date.now() - startedAt : 0;
    const session = {
      id: crypto.randomUUID(),
      date: today,
      name,
      exercises: structuredClone(exercises),
      duration,
      muscleGroups,
    };
    update((s) => ({
      ...s,
      history: [session, ...s.history],
      streak: nextStreak(s),
      lastWorkoutDate: today,
      exercises: [],
      muscleGroupHistory: { ...(s.muscleGroupHistory ?? {}), ...mgUpdates },
    }));
    // Reset timer
    sessionStorage.removeItem('fitlog_workout_start');
    setStartedAt(null);
    setElapsed(0);
    showToast(`Workout logged 🔥 ${nextStreak(state)} day streak`);
  };

  return (
    <>
      <AppScreen className="pb-2">
        <TopBar title="Exercise" onBell={() => showToast('No new notifications')} hasUnread />

        {/* Weekly streak */}
        <Card className="mb-6">
          <div className="text-[16px] font-semibold text-ink mb-4">Weekly Workout Streak</div>
          <div className="flex justify-between">
            {grid.map((d) => (
              <DayStreakCell key={d.iso} day={d.day} state={d.state} />
            ))}
          </div>
        </Card>

        {/* Today's workout */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold text-ink">Today&apos;s Workout</h2>
          {startedAt && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent-light tnum">
              <Timer className="w-4 h-4" strokeWidth={2} />
              {timerLabel(elapsed)}
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center mb-3">
            <div className="text-muted text-sm">No exercises yet.</div>
          </div>
        ) : (
          <div className="space-y-3 mb-3">
            {groups.map((group) => {
              const collapsed = collapsedGroups.has(group.key);
              return (
                <Card key={group.key} className="p-3.5">
                  <button onClick={() => toggleGroup(group.key)} className="w-full flex items-center justify-between mb-1">
                    <span className="text-[15px] font-semibold text-ink">{group.label}</span>
                    <ChevronDown className={`w-5 h-5 text-muted transition-transform ${collapsed ? '-rotate-90' : ''}`} strokeWidth={2} />
                  </button>
                  {!collapsed && (
                    <div className="space-y-2.5 mt-2">
                      {group.items.map((ex) => (
                        <ExerciseRow
                          key={ex.id}
                          ex={ex}
                          expanded={expandedId === ex.id}
                          onToggleExpand={() => setExpandedId((id) => (id === ex.id ? null : ex.id))}
                          update={update}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <button onClick={addExercise} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 py-3.5 text-sm font-medium text-muted hover:text-accent hover:border-accent/40 transition-colors mb-6">
          <Plus className="w-4 h-4" strokeWidth={2} /> Add Exercise
        </button>

        {/* Cardio (folded in) */}
        <Card className="p-3.5 mb-2">
          <button onClick={() => setShowCardio((v) => !v)} className="w-full flex items-center justify-between">
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Footprints className="w-[18px] h-[18px] text-accent" strokeWidth={1.9} /> Cardio
            </span>
            <ChevronDown className={`w-5 h-5 text-muted transition-transform ${showCardio ? '' : '-rotate-90'}`} strokeWidth={2} />
          </button>
          {showCardio && (
            <div className="mt-3 space-y-2">
              {cardioSessions.length === 0 ? (
                <div className="text-sm text-muted py-2">No cardio logged yet.</div>
              ) : (
                cardioSessions.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl bg-surface-2 border border-white/5 px-3 py-2.5">
                    <Activity className="w-4 h-4 text-accent shrink-0" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink capitalize">{c.type}</div>
                      <div className="text-[11px] text-muted tnum">{c.distanceKm} km · {c.pace} min/km</div>
                    </div>
                    <span className="text-sm text-muted tnum shrink-0">{c.calories} kcal</span>
                  </div>
                ))
              )}
              <button onClick={() => setCardioOpen(true)} className="w-full rounded-full border border-dashed border-white/15 text-faint text-xs py-2.5 hover:text-accent hover:border-accent/40 transition-colors">
                + Add Cardio
              </button>
            </div>
          )}
        </Card>
      </AppScreen>

      {/* Log Workout — docked just above the fixed bottom nav (main's bottom padding lifts it clear) */}
      <div className="sticky bottom-0 z-10 px-5 pt-2 pb-3 bg-base/85 backdrop-blur-xl border-t border-white/5">
        <GradientButton onClick={logWorkout}>Log Workout</GradientButton>
      </div>

      {cardioOpen && (
        <AddCardioSheet
          onClose={() => setCardioOpen(false)}
          onSave={saveCardio}
          bodyWeightKg={state.profile?.weightKg || undefined}
        />
      )}
    </>
  );
}
