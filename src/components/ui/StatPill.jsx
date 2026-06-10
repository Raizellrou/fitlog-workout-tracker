/** Labeled value tile (Height / Weight). */
export default function StatPill({ label, value, sub }) {
  return (
    <div className="flex-1 rounded-2xl bg-surface-2 border border-white/5 px-4 py-3 text-center">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-[19px] font-bold text-ink tnum">{value}</div>
      {sub && <div className="text-[11px] text-muted mt-0.5 tnum">{sub}</div>}
    </div>
  );
}
