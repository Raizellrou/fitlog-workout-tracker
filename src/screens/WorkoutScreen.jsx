import { useEffect, useRef } from 'react';
import EmptyState from '@/components/EmptyState';
import { timerLabel, compactVolume } from '@/lib/format';
import {
  makeExercise,
  makeSet,
  setVolume,
  workoutStats,
  MUSCLE_GROUPS,
  detectMuscleGroup,
  muscleGroupStatuses,
} from '@/lib/fitlog';

const STATUS_LABEL = {
  ready: 'Ready',
  recovering: 'Rest',
  needs_rest: 'Skip',
};

export default function WorkoutScreen({ state, update, timer }) {
  const { exercises, sessionName } = state;
  const stats = workoutStats(exercises);
  const statuses = muscleGroupStatuses(state.muscleGroupHistory ?? {});
  const focusLastRef = useRef(false);

  useEffect(() => {
    if (!focusLastRef.current) return;
    focusLastRef.current = false;
    const inputs = document.querySelectorAll('.exercise-name-input');
    inputs[inputs.length - 1]?.focus();
  }, [exercises.length]);

  const addExercise = () => {
    focusLastRef.current = true;
    update((s) => ({ ...s, exercises: [...s.exercises, makeExercise()] }));
  };

  const deleteExercise = (id) =>
    update((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== id) }));

  const updateExerciseName = (id, name) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) => {
        if (e.id !== id) return e;
        // Auto-suggest muscle group only while it hasn't been set
        const suggested = !e.muscleGroup ? detectMuscleGroup(name) : e.muscleGroup;
        return { ...e, name, muscleGroup: suggested };
      }),
    }));

  const updateMuscleGroup = (id, group) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === id ? { ...e, muscleGroup: group || null } : e
      ),
    }));

  const addSet = (id) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === id ? { ...e, sets: [...e.sets, makeSet(e.sets.at(-1))] } : e
      ),
    }));

  const updateSet = (id, idx, field, value) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === id
          ? {
              ...e,
              sets: e.sets.map((set, i) =>
                i === idx ? { ...set, [field]: value } : set
              ),
            }
          : e
      ),
    }));

  const toggleSetDone = (id, idx) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === id
          ? {
              ...e,
              sets: e.sets.map((set, i) =>
                i === idx ? { ...set, done: !set.done } : set
              ),
            }
          : e
      ),
    }));

  return (
    <div>
      {/* ── Live stats ── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{stats.exercises}</div>
          <div className="stat-label">Exercises</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.setsDone}</div>
          <div className="stat-label">Sets Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{compactVolume(stats.volume)}</div>
          <div className="stat-label">Vol (kg)</div>
        </div>
      </div>

      {/* ── Muscle group recovery grid ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="muscle-section-title">Muscle recovery</div>
        <div className="muscle-grid">
          {MUSCLE_GROUPS.map((group) => {
            const status = statuses[group];
            return (
              <div key={group} className={`muscle-card muscle-card--${status}`}>
                <div className="muscle-name">{group}</div>
                <div className="muscle-status-dot" />
                <div className="muscle-status-label">{STATUS_LABEL[status]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Session header ── */}
      <div className="session-header">
        <div className="session-name-wrap">
          <div className="session-dot" />
          <input
            className="session-name"
            type="text"
            placeholder="Session name..."
            maxLength={40}
            value={sessionName}
            onChange={(e) => update({ sessionName: e.target.value })}
          />
        </div>
        <button
          className={`timer-btn${timer.running ? ' running' : ''}`}
          onClick={timer.toggle}
        >
          {timerLabel(timer.elapsed)}
        </button>
      </div>

      {/* ── Exercise list ── */}
      {exercises.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="No exercises yet"
          sub='Tap "Add exercise" below to start logging your workout.'
        />
      ) : (
        exercises.map((ex, exIdx) => (
          <div className="exercise-entry" key={ex.id}>
            <div className="exercise-header">
              <div className="exercise-num">{exIdx + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  className="exercise-name-input"
                  type="text"
                  placeholder="Exercise name..."
                  maxLength={50}
                  value={ex.name}
                  onChange={(e) => updateExerciseName(ex.id, e.target.value)}
                />
                <select
                  className="muscle-group-select"
                  value={ex.muscleGroup ?? ''}
                  onChange={(e) => updateMuscleGroup(ex.id, e.target.value)}
                  style={{ marginTop: 4 }}
                >
                  <option value="">— muscle group —</option>
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="del-btn"
                onClick={() => deleteExercise(ex.id)}
                title="Remove exercise"
              >
                ✕
              </button>
            </div>

            <div className="sets-header">
              <span>Set</span>
              <span>Weight</span>
              <span>Reps</span>
              <span>Vol</span>
              <span />
            </div>

            {ex.sets.map((set, sIdx) => {
              const vol = setVolume(set);
              return (
                <div className="set-row" key={sIdx}>
                  <span className="set-num">{sIdx + 1}</span>
                  <input
                    className={`set-input${set.done ? ' done' : ''}`}
                    type="number"
                    min="0"
                    placeholder="kg"
                    value={set.weight}
                    onChange={(e) => updateSet(ex.id, sIdx, 'weight', e.target.value)}
                  />
                  <input
                    className={`set-input${set.done ? ' done' : ''}`}
                    type="number"
                    min="0"
                    placeholder="reps"
                    value={set.reps}
                    onChange={(e) => updateSet(ex.id, sIdx, 'reps', e.target.value)}
                  />
                  <span className="set-vol">{vol > 0 ? vol.toFixed(0) : '—'}</span>
                  <button
                    className={`done-btn${set.done ? ' checked' : ''}`}
                    onClick={() => toggleSetDone(ex.id, sIdx)}
                    title="Mark done"
                  >
                    {set.done ? '✓' : '·'}
                  </button>
                </div>
              );
            })}

            <div className="add-set-row">
              <button className="add-set-btn" onClick={() => addSet(ex.id)}>
                + add set
              </button>
            </div>
          </div>
        ))
      )}

      <button className="add-exercise-btn" onClick={addExercise}>
        <span style={{ fontSize: 18 }}>+</span> Add exercise
      </button>
    </div>
  );
}
