import { useState } from 'react';
import BottomTabBar from '@/components/ui/BottomTabBar';
import SignIn from '@/components/SignIn';
import DashboardScreen from '@/screens/DashboardScreen';
import ExerciseScreen from '@/screens/ExerciseScreen';
import NutritionScreen from '@/screens/NutritionScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useAuth } from '@/context/AuthContext';
import { useFitlogData } from '@/hooks/useFitlogData';

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const { state, update, today } = useFitlogData(user?.uid ?? null);
  const [tab, setTab] = useState('dashboard');

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
