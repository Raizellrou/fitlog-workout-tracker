/**
 * Circular gauge (~270°) with a small upward trend line overlaid.
 * Used for the dashboard "Consistency Score".
 */
export default function ScoreRing({ score = 0, max = 100, delta, size = 180 }) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  const circ = 2 * Math.PI * r;
  const arcFrac = 0.75; // 270° visible track
  const track = circ * arcFrac;
  const prog = track * Math.max(0, Math.min(1, max ? score / max : 0));

  return (
    <div className="relative mx-auto" style={{ width: size }}>
      {/* Ring */}
      <svg viewBox="0 0 180 180" className="w-full -rotate-[135deg]">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-deep)" />
            <stop offset="55%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-light)" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${track} ${circ}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
        />
      </svg>

      {/* Upward trend line overlay */}
      <svg viewBox="0 0 180 180" className="absolute inset-0 w-full pointer-events-none">
        <polyline
          points="52,112 76,94 98,103 120,72 140,58"
          fill="none"
          stroke="var(--color-accent-light)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="131,57 140,58 139,67"
          fill="none"
          stroke="var(--color-accent-light)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs text-muted leading-tight text-center">Consistency Score</div>
        <div className="text-[40px] font-bold text-ink leading-none mt-1 tnum">{score}</div>
        {delta != null && (
          <div className="text-xs font-semibold text-success mt-1">↑ {delta}%</div>
        )}
      </div>
    </div>
  );
}
