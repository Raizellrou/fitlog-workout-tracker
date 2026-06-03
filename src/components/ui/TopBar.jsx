import { Bell } from 'lucide-react';

/**
 * Screen header. variant 'large-left' (title + optional bell) or 'centered'.
 */
export default function TopBar({ title, variant = 'large-left', onBell, hasUnread = false }) {
  if (variant === 'centered') {
    return (
      <header className="flex items-center justify-center pt-3 pb-5">
        <h1 className="text-[24px] font-bold text-ink tracking-tight">{title}</h1>
      </header>
    );
  }
  return (
    <header className="flex items-center justify-between pt-3 pb-5">
      <h1 className="text-[30px] font-bold text-ink tracking-tight">{title}</h1>
      <button
        onClick={onBell}
        aria-label="Notifications"
        className="relative grid place-items-center w-10 h-10 rounded-full bg-surface border border-white/5"
      >
        <Bell className="w-[18px] h-[18px] text-muted" strokeWidth={1.75} />
        {hasUnread && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent ring-2 ring-base" />
        )}
      </button>
    </header>
  );
}
