import { X } from 'lucide-react';

/**
 * Bottom sheet modal: dimmed backdrop + slide-up panel with a drag handle,
 * a title/close header, a scrollable body, and an optional sticky footer.
 * Shared shell so every sheet has identical proportions and behavior.
 */
export default function BottomSheet({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-[480px] max-h-[90dvh] flex-col bg-surface border-t border-white/10 rounded-t-[28px] animate-slide-up">
        {/* Drag handle */}
        <div className="grid shrink-0 place-items-center pt-3 pb-1">
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-4">
          <h2 className="text-[20px] font-bold text-ink tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 border border-white/8 text-muted hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pb-2">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div
            className="shrink-0 border-t border-white/5 px-5 pt-4"
            style={{ paddingBottom: 'calc(18px + var(--safe-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
