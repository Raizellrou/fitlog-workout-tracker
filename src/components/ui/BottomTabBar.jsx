import { Home, Dumbbell, UtensilsCrossed, Settings } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'exercise', label: 'Exercise', Icon: Dumbbell },
  { id: 'food', label: 'Food', Icon: UtensilsCrossed },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

/** Persistent 4-tab bottom navigation with violet active state. */
export default function BottomTabBar({ tab, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 flex items-stretch border-t border-white/5 bg-base/80 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            <Icon
              className={active ? 'w-[22px] h-[22px] text-accent' : 'w-[22px] h-[22px] text-faint'}
              strokeWidth={active ? 2.2 : 1.75}
            />
            <span className={active ? 'text-[11px] text-accent font-medium' : 'text-[11px] text-faint'}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
