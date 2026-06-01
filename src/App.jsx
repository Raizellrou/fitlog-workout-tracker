import { useState } from 'react';
import Header from '@/components/Header';
import TabNav from '@/components/TabNav';
import SignIn from '@/components/SignIn';
import FinishModal from '@/components/FinishModal';
import WorkoutScreen from '@/screens/WorkoutScreen';
import FoodScreen from '@/screens/FoodScreen';
import CardioScreen from '@/screens/CardioScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useFitlogData } from '@/hooks/useFitlogData';
import { useTimer } from '@/hooks/useTimer';
import { nextStreak, extractMuscleGroups } from '@/lib/fitlog';

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { state, update, today } = useFitlogData(user?.uid ?? null);
  const timer = useTimer();

  const [tab, setTab] = useState('workout');
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="sync-pill">
          <span className="sync-dot" /> Loading…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <SignIn />;

  const openFinish = () => {
    if (state.exercises.length === 0) {
      showToast('Add at least one exercise');
      return;
    }
    setModalOpen(true);
  };

  const finishSession = () => {
    const name = state.sessionName.trim() || 'Workout';
    const muscleGroups = extractMuscleGroups(state.exercises);

    // Update muscleGroupHistory: record today for every group worked
    const mgUpdates = Object.fromEntries(muscleGroups.map((g) => [g, today]));

    const session = {
      id: crypto.randomUUID(),
      date: today,
      name,
      exercises: structuredClone(state.exercises),
      duration: timer.elapsed,
      muscleGroups,
    };

    update((s) => ({
      ...s,
      history: [session, ...s.history],
      streak: nextStreak(s),
      lastWorkoutDate: today,
      exercises: [],
      sessionName: 'Morning Session',
      muscleGroupHistory: { ...(s.muscleGroupHistory ?? {}), ...mgUpdates },
    }));

    timer.reset();
    setModalOpen(false);
    setTab('history');
    showToast(`Session saved! 🔥 ${nextStreak(state)} day streak`);
  };

  // The workout tab has a bottom "finish" CTA; the food tab manages its own
  // Add Meal button + modal, so no global CTA there.
  const showCta = tab === 'workout';
  const summary = `${state.sessionName.trim() || 'Workout'} · ${state.exercises.length} exercise(s)`;

  return (
    <>
      <Header tab={tab} />
      <TabNav tab={tab} onChange={setTab} />

      <div className="content">
        {tab === 'workout' && (
          <WorkoutScreen state={state} update={update} timer={timer} />
        )}
        {tab === 'food' && (
          <FoodScreen state={state} update={update} />
        )}
        {tab === 'cardio' && (
          <CardioScreen state={state} update={update} />
        )}
        {tab === 'history' && <HistoryScreen state={state} />}
      </div>

      {showCta && (
        <div className="bottom-nav">
          <button className="cta-btn" onClick={openFinish}>
            FINISH SESSION
          </button>
        </div>
      )}

      <FinishModal
        open={modalOpen}
        summary={summary}
        onCancel={() => setModalOpen(false)}
        onConfirm={finishSession}
      />
    </>
  );
}
