/**
 * Circular gauge (~270°) with a trend-line overlay.
 * Used for the dashboard "Consistency Score".
 *
 * Props:
 *   score       — current score value (0–max)
 *   max         — top of range (default 100)
 *   delta       — signed integer change vs last period; shows ↑ / ↓ indicator
 *   size        — rendered pixel size (default 180)
 *   trendPoints — array of 2–N numbers (0–100), oldest → newest.
 *                 Mapped to an SVG polyline inside the ring.
 *                 Falls back to a static demo line when omitted.
 */
export default function ScoreRing({ score = 0, max = 100, delta, size = 180, trendPoints }) {
  const r     = 70;
  const cx    = 90;
  const cy    = 90;
  const circ  = 2 * Math.PI * r;
  const arcFrac = 0.75; // 270° visible track
  const track = circ * arcFrac;
  const prog  = track * Math.max(0, Math.min(1, max ? score / max : 0));

  // ── Trend polyline ──────────────────────────────────────────────────────
  // SVG coordinate bounds for the mini chart drawn inside the ring:
  //   x : 52 → 140   (range 88 px)
  //   y : 112 (score = 0) → 58 (score = 100)   (range 54 px, inverted)
  const X0 = 52, X1 = 140;
  const Y0 = 112, Y1 = 58;

  const pts = trendPoints?.length >= 2 ? trendPoints : [25, 45, 40, 65, score];

  const toSVG = (s, i, arr) => {
    const x = Math.round(X0 + (i / (arr.length - 1)) * (X1 - X0));
    const y = Math.round(Y0 - (Math.max(0, Math.min(100, s)) / 100) * (Y0 - Y1));
    return [x, y];
  };

  const svgPts   = pts.map(toSVG);
  const mainLine = svgPts.map(([x, y]) => `${x},${y}`).join(' ');

  // Arrow tick at the end: go from second-to-last → last → perpendicular nub
  const [ax1, ay1] = svgPts[svgPts.length - 2];
  const [ax2, ay2] = svgPts[svgPts.length - 1];
  const ddx = ax2 - ax1;
  const ddy = ay2 - ay1;
  const mag = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
  // Rotate 90° clockwise for the tick direction
  const tickX = Math.round(ax2 + (ddy / mag) * 9);
  const tickY = Math.round(ay2 + (-ddx / mag) * 9);
  const arrowLine = `${ax1},${ay1} ${ax2},${ay2} ${tickX},${tickY}`;

  return (
    <div className="relative mx-auto" style={{ width: size }}>
      {/* Ring */}
      <svg viewBox="0 0 180 180" className="w-full -rotate-[135deg]">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="var(--color-accent-deep)" />
            <stop offset="55%"  stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-light)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${track} ${circ}`}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
        />
      </svg>

      {/* Trend line overlay */}
      <svg viewBox="0 0 180 180" className="absolute inset-0 w-full pointer-events-none">
        <polyline
          points={mainLine}
          fill="none"
          stroke="var(--color-accent-light)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <polyline
          points={arrowLine}
          fill="none"
          stroke="var(--color-accent-light)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs text-muted leading-tight text-center">Consistency Score</div>
        <div className="text-[40px] font-bold text-ink leading-none mt-1 tnum">{score}</div>
        {delta != null && (
          <div
            className={`text-xs font-semibold mt-1 ${
              delta >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
    </div>
  );
}
