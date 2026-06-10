import { useState, useEffect } from 'react';
import BottomTabBar from '@/components/ui/BottomTabBar';
import SignIn from '@/components/SignIn';
import DashboardScreen from '@/screens/DashboardScreen';
import ExerciseScreen from '@/screens/ExerciseScreen';
import NutritionScreen from '@/screens/NutritionScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useAuth } from '@/context/AuthContext';
import { useFitlogData } from '@/hooks/useFitlogData';
import { lastWorkoutIso } from '@/lib/fitlog';

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const { state, update, today } = useFitlogData(user?.uid ?? null);
  const [tab, setTab] = useState('dashboard');

  // ── Workout reminder notification ─────────────────────────────────────────
  // Fires ~30 s after app load when notifications are enabled and the user
  // hasn't logged a workout recently. Works while the tab is open (no push server needed).
  useEffect(() => {
    if (!state.notificationsEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const last = lastWorkoutIso(state.history ?? []);
    const daysSince = last
      ? (Date.now() - new Date(last + 'T00:00:00').getTime()) / 86_400_000
      : Infinity;

    if (daysSince < 1) return; // worked out today — no reminder needed

    const timer = setTimeout(() => {
      try {
        new Notification('FitLog 💪', {
          body: daysSince > 2
            ? "It's been a while — time to log a workout!"
            : "Keep the streak alive — log today's session!",
          icon: '/pwa-192x192.png',
        });
      } catch {
        // Browser may block (e.g. incognito) — silently ignore
      }
    }, 30_000);

    return () => clearTimeout(timer);
  }, [state.notificationsEnabled, state.history]);

  if (loading) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="text-sm text-muted">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) return <SignIn />;

  return (
    <>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(var(--nav-height)+var(--safe-bottom))]">
        {tab === 'dashboard' && <DashboardScreen state={state} update={update} today={today} />}
        {tab === 'exercise' && <ExerciseScreen state={state} update={update} today={today} />}
        {tab === 'food' && <NutritionScreen state={state} update={update} today={today} />}
        {tab === 'settings' && <SettingsScreen state={state} update={update} today={today} />}
      </main>
      <BottomTabBar tab={tab} onChange={setTab} />
    </>
  );
}
