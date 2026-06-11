import { useState, useEffect } from 'react';
import {
  Dumbbell, ChevronDown, Check, Plus, Trash2, Footprints, Activity, Timer, Bookmark,
  CalendarDays, Pencil,
} from 'lucide-react';
import AppScreen from '@/components/ui/AppScreen';
import TopBar from '@/components/ui/TopBar';
import Card from '@/components/ui/Card';
import GradientButton from '@/components/ui/GradientButton';
import BottomSheet from '@/components/ui/BottomSheet';
import ConfirmSheet from '@/components/ui/ConfirmSheet';
import DayStreakCell from '@/components/ui/DayStreakCell';
import { useToast } from '@/context/ToastContext';
import { timerLabel } from '@/lib/format';
import Toggle from '@/components/ui/Toggle';
import {
  makeExercise, makeSet, MUSCLE_GROUPS, detectMuscleGroup,
  extractMuscleGroups, nextStreak, weekGrid,
  CARDIO_TYPES, calcCardio,
  makeExerciseTemplate, exerciseFromTemplate,
  makeSplit, splitDayForToday, exercisesFromSplitDay,
  splitWorkoutDays, nextSplitWorkoutDay,
  WEEKDAY_KEYS, WEEKDAY_SHORT,
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
function ExerciseRow({ ex, expanded, onToggleExpand, update, onDelete, onSaveTemplate }) {
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
            {ex.name.trim() && (
              <button onClick={() => onSaveTemplate(ex)} aria-label="Save as template" className="grid place-items-center w-9 rounded-full border border-white/8 text-faint hover:text-accent">
                <Bookmark className="w-4 h-4" strokeWidth={1.9} />
              </button>
            )}
            <button onClick={() => onDelete(ex)} aria-label="Delete exercise" className="grid place-items-center w-9 rounded-full border border-white/8 text-faint hover:text-danger">
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

// ── Template picker sheet ────────────────────────────────────────────────────
function TemplatePickerSheet({ templates, onClose, onPick, onDelete }) {
  return (
    <BottomSheet title="Add Exercise" onClose={onClose}>
      {templates.length > 0 && (
        <>
          <div className="text-[13px] font-medium text-muted mb-2">From Template</div>
          <div className="rounded-2xl bg-surface-2 border border-white/5 overflow-hidden mb-4">
            {templates.map((t) => {
              const setInfo = t.defaultSets.length;
              const tw = t.defaultSets.reduce((max, s) => Math.max(max, parseFloat(s.weight) || 0), 0);
              return (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-white/5 last:border-0">
                  <button
                    onClick={() => onPick(t)}
                    className="flex-1 min-w-0 text-left active:bg-white/5"
                  >
                    <div className="text-sm font-medium text-ink truncate">{t.name}</div>
                    <div className="text-[11px] text-muted tnum truncate">
                      {titleCase(t.muscleGroup)} · {setInfo} set{setInfo !== 1 ? 's' : ''}{tw > 0 ? ` · ${tw} kg` : ''}
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="text-faint hover:text-danger shrink-0"
                    aria-label="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.9} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
      <button
        onClick={() => onPick(null)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 py-3.5 text-sm font-medium text-muted hover:text-accent hover:border-accent/40 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2} /> Start from Scratch
      </button>
    </BottomSheet>
  );
}

// ── Split manager sheet ──────────────────────────────────────────────────────
function SplitManagerSheet({ splits, activeSplitId, onActivate, onEdit, onDelete, onCreate, onClose }) {
  return (
    <BottomSheet title="Workout Splits" onClose={onClose}>
      {splits.length === 0 ? (
        <div className="text-center py-8 mb-4">
          <div className="text-3xl mb-3">📋</div>
          <div className="text-sm text-muted">No splits created yet.</div>
          <div className="text-xs text-faint mt-1">Create a program like PPL, Upper/Lower, or Full Body</div>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {splits.map((s) => {
            const isActive = s.id === activeSplitId;
            const days = splitWorkoutDays(s);
            return (
              <div key={s.id} className={`flex items-center gap-3 rounded-2xl bg-surface-2 border px-3.5 py-3 ${isActive ? 'border-accent/30' : 'border-white/5'}`}>
                <button
                  onClick={() => onActivate(s.id)}
                  className="flex-1 min-w-0 text-left active:opacity-70"
                >
                  <div className="text-[15px] font-semibold text-ink truncate">{s.name}</div>
                  <div className="text-xs text-muted tnum">{days} workout day{days !== 1 ? 's' : ''} / week</div>
                </button>
                {isActive && (
                  <span className="text-[11px] font-semibold text-accent px-2.5 py-1 rounded-full bg-accent-soft shrink-0">Active</span>
                )}
                <button onClick={() => onEdit(s)} className="text-faint hover:text-accent shrink-0 p-1" aria-label="Edit split">
                  <Pencil className="w-4 h-4" strokeWidth={1.9} />
                </button>
                <button onClick={() => onDelete(s.id)} className="text-faint hover:text-danger shrink-0 p-1" aria-label="Delete split">
                  <Trash2 className="w-4 h-4" strokeWidth={1.9} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <GradientButton onClick={onCreate}>Create New Split</GradientButton>
    </BottomSheet>
  );
}

// ── Split editor sheet ───────────────────────────────────────────────────────
function SplitEditorSheet({ split, onSave, onClose, exerciseTemplates }) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState(() => structuredClone(split));
  const [expandedDay, setExpandedDay] = useState(null);
  const [addExName, setAddExName] = useState('');
  const [addExGroup, setAddExGroup] = useState('');

  const updateDay = (key, updater) =>
    setDraft((prev) => ({
      ...prev,
      days: { ...prev.days, [key]: typeof updater === 'function' ? updater(prev.days[key]) : updater },
    }));

  const toggleDayRest = (key) =>
    updateDay(key, (day) => ({
      ...day,
      isRest: !day.isRest,
      label: day.isRest ? '' : 'Rest',
    }));

  const setDayLabel = (key, label) => updateDay(key, (day) => ({ ...day, label }));

  const addExFromTemplate = (dayKey, template) =>
    updateDay(dayKey, (day) => ({
      ...day,
      exercises: [
        ...day.exercises,
        { name: template.name, muscleGroup: template.muscleGroup, defaultSets: structuredClone(template.defaultSets) },
      ],
    }));

  const addCustomEx = (dayKey) => {
    if (!addExName.trim()) return;
    updateDay(dayKey, (day) => ({
      ...day,
      exercises: [
        ...day.exercises,
        {
          name: addExName.trim(),
          muscleGroup: addExGroup || detectMuscleGroup(addExName) || null,
          defaultSets: [{ reps: '10', weight: '' }, { reps: '10', weight: '' }, { reps: '10', weight: '' }],
        },
      ],
    }));
    setAddExName('');
    setAddExGroup('');
  };

  const removeEx = (dayKey, idx) =>
    updateDay(dayKey, (day) => ({ ...day, exercises: day.exercises.filter((_, i) => i !== idx) }));

  const toggleDay = (key) => {
    setExpandedDay((prev) => (prev === key ? null : key));
    setAddExName('');
    setAddExGroup('');
  };

  const save = () => {
    if (!draft.name.trim()) return showToast('Enter a split name');
    onSave({ ...draft, name: draft.name.trim() });
  };

  return (
    <BottomSheet
      title={split.name ? 'Edit Split' : 'New Split'}
      onClose={onClose}
      footer={<GradientButton onClick={save}>Save Split</GradientButton>}
    >
      <input
        className="w-full rounded-xl bg-surface-2 border border-white/5 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent/50 mb-4"
        placeholder="Split name (e.g. Push Pull Legs)"
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
      />

      <div className="space-y-2">
        {WEEKDAY_KEYS.map((key) => {
          const day = draft.days[key];
          const isExpanded = expandedDay === key;
          return (
            <div key={key} className="rounded-2xl bg-surface-2 border border-white/5 overflow-hidden">
              {/* Day header row */}
              <div className="flex items-center gap-3 px-3.5 py-2.5">
                <button onClick={() => !day.isRest && toggleDay(key)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink w-10">{WEEKDAY_SHORT[key]}</span>
                    {day.isRest ? (
                      <span className="text-xs text-faint">Rest</span>
                    ) : (
                      <>
                        <span className="text-xs text-muted truncate">{day.label || '—'}</span>
                        <span className="text-[11px] text-faint shrink-0">· {day.exercises.length} ex</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-faint transition-transform ${isExpanded ? '' : '-rotate-90'}`} strokeWidth={2} />
                      </>
                    )}
                  </div>
                </button>
                <Toggle checked={!day.isRest} onChange={() => toggleDayRest(key)} />
              </div>

              {/* Expanded: label + exercises */}
              {isExpanded && !day.isRest && (
                <div className="px-3.5 pb-3.5 border-t border-white/5 pt-3 space-y-2.5">
                  <input
                    className="w-full rounded-lg bg-surface border border-white/8 px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
                    placeholder="Day label (e.g. Push Day)"
                    value={day.label}
                    onChange={(e) => setDayLabel(key, e.target.value)}
                  />

                  {/* Exercise list */}
                  {day.exercises.length > 0 && (
                    <div className="space-y-1">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-surface border border-white/6 px-2.5 py-1.5">
                          <span className="text-sm text-ink truncate flex-1">{ex.name}</span>
                          {ex.muscleGroup && <span className="text-[11px] text-faint shrink-0">{titleCase(ex.muscleGroup)}</span>}
                          <button onClick={() => removeEx(key, i)} className="text-faint hover:text-danger shrink-0" aria-label="Remove">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick add from templates */}
                  {exerciseTemplates.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exerciseTemplates.slice(0, 8).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => addExFromTemplate(key, t)}
                          className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-accent-soft text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                        >
                          + {t.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom exercise adder */}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 min-w-0 rounded-lg bg-surface border border-white/8 px-2.5 py-2 text-sm text-ink outline-none focus:border-accent/50"
                      placeholder="Exercise name"
                      value={addExName}
                      onChange={(e) => setAddExName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomEx(key)}
                    />
                    <select
                      className="w-24 rounded-lg bg-surface border border-white/8 px-1.5 py-2 text-[11px] text-muted outline-none focus:border-accent/50"
                      value={addExGroup}
                      onChange={(e) => setAddExGroup(e.target.value)}
                    >
                      <option value="">Group</option>
                      {MUSCLE_GROUPS.map((g) => (
                        <option key={g} value={g}>{titleCase(g)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => addCustomEx(key)}
                      className="grid place-items-center w-9 shrink-0 rounded-lg bg-accent-soft text-accent border border-accent/20 hover:bg-accent/20"
                      aria-label="Add exercise"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function ExerciseScreen({ state, update, today }) {
  const { exercises, cardioSessions = [], exerciseTemplates = [], workoutSplits = [], activeSplitId = null } = state;
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [cardioOpen, setCardioOpen] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [splitView, setSplitView] = useState(null);        // null | 'manager' | 'editor'
  const [editingSplit, setEditingSplit] = useState(null);   // split draft for editor

  // ── Split-derived state ───────────────────────────────────────────────────
  const activeSplit = workoutSplits.find((s) => s.id === activeSplitId) ?? null;
  const todaySplitDay = activeSplit ? splitDayForToday(activeSplit, today) : null;
  const isRestDay = !!(activeSplit && todaySplitDay?.isRest);
  const showRestCard = isRestDay && exercises.length === 0;
  const nextWorkout = activeSplit ? nextSplitWorkoutDay(activeSplit, today) : null;

  // ── Auto-populate exercises from active split on a fresh workout day ──────
  useEffect(() => {
    const popKey = 'fitlog_split_populated';
    const stamp = activeSplitId ? `${activeSplitId}_${today}` : '';
    if (!stamp || sessionStorage.getItem(popKey) === stamp) return;
    if (!activeSplit) return;
    const dayInfo = splitDayForToday(activeSplit, today);
    if (dayInfo.isRest || dayInfo.exercises.length === 0 || exercises.length > 0) {
      sessionStorage.setItem(popKey, stamp);
      return;
    }
    const newExercises = exercisesFromSplitDay(dayInfo);
    update((s) => ({ ...s, exercises: newExercises, sessionName: dayInfo.label || activeSplit.name }));
    sessionStorage.setItem(popKey, stamp);
  }, [activeSplit, activeSplitId, exercises.length, today, update]);

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
    if (exerciseTemplates.length > 0) {
      setTemplatePickerOpen(true);
    } else {
      const ex = makeExercise();
      update((s) => ({ ...s, exercises: [...s.exercises, ex] }));
      setExpandedId(ex.id);
    }
  };

  const handleTemplatePick = (template) => {
    setTemplatePickerOpen(false);
    const ex = template ? exerciseFromTemplate(template) : makeExercise();
    update((s) => ({ ...s, exercises: [...s.exercises, ex] }));
    setExpandedId(ex.id);
  };

  const saveExerciseTemplate = (exercise) => {
    const template = makeExerciseTemplate(exercise);
    update((s) => ({ ...s, exerciseTemplates: [...(s.exerciseTemplates ?? []), template] }));
    showToast('Template saved ✓');
  };

  const deleteExerciseTemplate = (id) => {
    update((s) => ({ ...s, exerciseTemplates: (s.exerciseTemplates ?? []).filter((t) => t.id !== id) }));
    showToast('Template deleted');
  };

  // ── Split management handlers ──────────────────────────────────────────────
  const openSplitManager = () => setSplitView('manager');
  const openSplitEditor = (split) => {
    setEditingSplit(split ? structuredClone(split) : makeSplit(''));
    setSplitView('editor');
  };
  const closeSplitSheet = () => {
    setSplitView(null);
    setEditingSplit(null);
  };
  const backToManager = () => {
    setEditingSplit(null);
    setSplitView('manager');
  };
  const saveSplit = (draft) => {
    update((s) => {
      const existing = (s.workoutSplits ?? []).find((sp) => sp.id === draft.id);
      const splits = existing
        ? (s.workoutSplits ?? []).map((sp) => (sp.id === draft.id ? draft : sp))
        : [...(s.workoutSplits ?? []), draft];
      return { ...s, workoutSplits: splits };
    });
    showToast('Split saved ✓');
    backToManager();
  };
  const deleteSplit = (id) => {
    update((s) => ({
      ...s,
      workoutSplits: (s.workoutSplits ?? []).filter((sp) => sp.id !== id),
      activeSplitId: s.activeSplitId === id ? null : s.activeSplitId,
    }));
    showToast('Split deleted');
  };
  const activateSplit = (id) => {
    update((s) => ({ ...s, activeSplitId: s.activeSplitId === id ? null : id }));
    showToast(state.activeSplitId === id ? 'Split deactivated' : 'Split activated ✓');
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

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'exercise') {
      update((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== deleteTarget.id) }));
    } else {
      update((s) => ({ ...s, cardioSessions: (s.cardioSessions ?? []).filter((c) => c.id !== deleteTarget.id) }));
    }
    setDeleteTarget(null);
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

        {/* Manage Splits link */}
        <button
          onClick={openSplitManager}
          className="w-full flex items-center gap-3 rounded-2xl bg-surface-2 border border-white/5 px-3.5 py-3 mb-5 active:scale-[0.99] transition-transform"
        >
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-accent-soft text-accent shrink-0">
            <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[14px] font-semibold text-ink truncate">
              {activeSplit ? activeSplit.name : 'Workout Splits'}
            </div>
            <div className="text-xs text-muted truncate">
              {activeSplit
                ? `${splitWorkoutDays(activeSplit)}-day program · ${todaySplitDay?.isRest ? 'Rest today' : (todaySplitDay?.label || 'Workout today')}`
                : 'Set up your training program'}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted -rotate-90" strokeWidth={2} />
        </button>

        {/* Split banner — workout day */}
        {activeSplit && !isRestDay && todaySplitDay?.label && (
          <div className="flex items-center gap-3 rounded-2xl bg-accent-soft/50 border border-accent/15 px-4 py-3 mb-4">
            <CalendarDays className="w-5 h-5 text-accent shrink-0" strokeWidth={1.9} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{todaySplitDay.label}</div>
              <div className="text-xs text-muted">{activeSplit.name} · {todaySplitDay.exercises.length} exercises</div>
            </div>
          </div>
        )}

        {/* Rest day card */}
        {showRestCard && (
          <Card className="mb-6 text-center py-8">
            <div className="text-4xl mb-3">😴</div>
            <div className="text-lg font-semibold text-ink mb-1">Rest Day</div>
            <div className="text-sm text-muted mb-4">Recover & come back stronger</div>
            {nextWorkout && (
              <div className="text-xs text-faint">
                Next up: <span className="text-accent font-medium">{nextWorkout.label}</span> ({WEEKDAY_SHORT[nextWorkout.key]})
              </div>
            )}
          </Card>
        )}

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
                          onDelete={(e) => setDeleteTarget({ kind: 'exercise', id: e.id, name: e.name || 'this exercise' })}
                          onSaveTemplate={saveExerciseTemplate}
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
                    <button
                      onClick={() => setDeleteTarget({ kind: 'cardio', id: c.id, name: `${c.type} (${c.distanceKm} km)` })}
                      aria-label="Delete cardio"
                      className="text-faint hover:text-danger shrink-0"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.9} />
                    </button>
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

      {templatePickerOpen && (
        <TemplatePickerSheet
          templates={exerciseTemplates}
          onClose={() => setTemplatePickerOpen(false)}
          onPick={handleTemplatePick}
          onDelete={deleteExerciseTemplate}
        />
      )}

      {cardioOpen && (
        <AddCardioSheet
          onClose={() => setCardioOpen(false)}
          onSave={saveCardio}
          bodyWeightKg={state.profile?.weightKg || undefined}
        />
      )}

      {deleteTarget && (
        <ConfirmSheet
          title={`Delete ${deleteTarget.kind === 'exercise' ? 'Exercise' : 'Cardio'}`}
          message={`Delete "${deleteTarget.name}"? This can't be undone.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {splitView === 'manager' && (
        <SplitManagerSheet
          splits={workoutSplits}
          activeSplitId={activeSplitId}
          onActivate={activateSplit}
          onEdit={openSplitEditor}
          onDelete={deleteSplit}
          onCreate={() => openSplitEditor(null)}
          onClose={closeSplitSheet}
        />
      )}

      {splitView === 'editor' && editingSplit && (
        <SplitEditorSheet
          split={editingSplit}
          onSave={saveSplit}
          onClose={backToManager}
          exerciseTemplates={exerciseTemplates}
        />
      )}
    </>
  );
}
