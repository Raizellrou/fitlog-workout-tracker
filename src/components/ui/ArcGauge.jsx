/**
 * 270° ring gauge for a single value (calorie intake), with the value and goal
 * stacked in the center. Matches the Consistency Score ring family on the dashboard.
 */
export default function ArcGauge({ value = 0, max = 1, unit = 'kcal', goalLabel, size = 208 }) {
  const r = 70;
  const cx = 90;
  const cy = 90;
  const circ = 2 * Math.PI * r;
  const arcFrac = 0.75; // 270° visible track
  const track = circ * arcFrac;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const prog = track * pct;

  return (
    <div className="relative mx-auto" style={{ width: size }}>
      <svg viewBox="0 0 180 180" className="w-full -rotate-[135deg]">
        <defs>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
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
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${track} ${circ}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#arc-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
          className="transition-[stroke-dasharray] duration-700"
          style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-1 tnum">
          <span className="text-[34px] font-bold text-ink leading-none">{value.toLocaleString()}</span>
          <span className="text-sm font-medium text-muted">{unit}</span>
        </div>
        {goalLabel && <div className="text-[13px] text-muted mt-1.5">{goalLabel}</div>}
      </div>
    </div>
  );
}
