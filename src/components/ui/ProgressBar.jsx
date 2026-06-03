/** Rounded track + violet-gradient fill + optional % label. */
export default function ProgressBar({ value, max = 100, showLabel = false, className = '' }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full accent-gradient rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-sm font-semibold text-ink tnum shrink-0">{Math.round(pct)}%</span>}
    </div>
  );
}
