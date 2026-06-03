import { X } from 'lucide-react';

const TONE = {
  neutral: 'text-muted',
  warning: 'text-warning',
  danger: 'text-danger',
};
const RING = {
  neutral: 'border-white/5',
  warning: 'border-warning/25',
  danger: 'border-danger/25',
};

/** Icon + text notice. tone: 'neutral' | 'warning' | 'danger'. */
export default function NoticeCard({ tone = 'neutral', icon, children, onDismiss }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-surface border ${RING[tone]} px-4 py-3.5`}>
      <span className={`${TONE[tone]} shrink-0`}>{icon}</span>
      <div className="flex-1 text-[13px] text-muted leading-snug">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-faint shrink-0 hover:text-muted">
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
