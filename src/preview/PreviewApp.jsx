import { useState } from 'react';
import BottomTabBar from '@/components/ui/BottomTabBar';
import DashboardScreen from '@/screens/DashboardScreen';
import ExerciseScreen from '@/screens/ExerciseScreen';
import NutritionScreen from '@/screens/NutritionScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { previewState, PREVIEW_TODAY } from './mockState';

// TEMP preview shell (not shipped): renders the 4 screens with mock data,
// no Firebase/auth, so the UI can be screenshotted and iterated visually.
export default function PreviewApp() {
  const [state, setState] = useState(previewState);
  const [tab, setTab] = useState('dashboard');

  const update = (updater) =>
    setState((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));

  const props = { state, update, today: PREVIEW_TODAY };

  return (
    <>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(var(--nav-height)+var(--safe-bottom))]">
        {tab === 'dashboard' && <DashboardScreen {...props} />}
        {tab === 'exercise' && <ExerciseScreen {...props} />}
        {tab === 'food' && <NutritionScreen {...props} />}
        {tab === 'settings' && <SettingsScreen {...props} />}
      </main>
      <BottomTabBar tab={tab} onChange={setTab} />
    </>
  );
}
