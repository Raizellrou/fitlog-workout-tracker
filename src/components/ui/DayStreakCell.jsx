import { Check } from 'lucide-react';

/** Vertical day pill. state: 'done' | 'today' | 'empty'. */
export default function DayStreakCell({ day, state }) {
  const pill =
    state === 'done'
      ? 'accent-gradient glow-accent text-white'
      : state === 'today'
        ? 'border-2 border-accent/60 bg-accent-soft text-accent-light'
        : 'bg-surface-2 border border-white/5 text-faint';
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`text-[11px] ${state === 'today' ? 'font-semibold text-ink' : 'text-muted'}`}>
        {day}
      </span>
      <div className={`grid h-[52px] w-9 place-items-center rounded-[14px] ${pill}`}>
        {state === 'done' && <Check className="h-4 w-4" strokeWidth={2.5} />}
        {state === 'today' && <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />}
      </div>
    </div>
  );
}
