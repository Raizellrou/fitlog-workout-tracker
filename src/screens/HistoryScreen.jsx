import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import EmptyState from '@/components/EmptyState';
import { longDate, formatDuration } from '@/lib/format';
import { setVolume } from '@/lib/fitlog';

function sessionVolume(session) {
  let vol = 0;
  for (const ex of session.exercises || []) {
    for (const set of ex.sets || []) {
      if (set.done) vol += setVolume(set);
    }
  }
  return Math.round(vol);
}

export default function HistoryScreen({ state }) {
  const { history, streak } = state;

  // Oldest → newest for the trend line, last 10 sessions.
  const chartData = [...history]
    .reverse()
    .slice(-10)
    .map((s) => ({
      label: longDate(s.date).split(',')[0],
      volume: sessionVolume(s),
    }));

  const hasVolume = chartData.some((d) => d.volume > 0);

  return (
    <div>
      {streak > 0 && (
        <div className="streak-banner">
          <div className="streak-num">{streak}</div>
          <div className="streak-text">
            <div className="streak-label">Day streak</div>
            <div className="streak-sub">
              {streak === 1
                ? 'Keep it going tomorrow!'
                : "You're on fire, keep it up!"}
            </div>
          </div>
          <span className="streak-fire">🔥</span>
        </div>
      )}

      {hasVolume && (
        <div className="food-section">
          <div className="food-section-title">Volume trend</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8ff00" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#c8ff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#606070', fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#242428',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    fontFamily: 'DM Mono',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#9090a0' }}
                  itemStyle={{ color: '#c8ff00' }}
                  formatter={(v) => [`${v} kg`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#c8ff00"
                  strokeWidth={2}
                  fill="url(#vol)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="food-section-title" style={{ marginBottom: 14 }}>
        Past workouts
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No history yet"
          sub="Finish your first session to see it here."
        />
      ) : (
        history.map((s) => {
          const names = (s.exercises || [])
            .map((e) => e.name || 'Unnamed')
            .slice(0, 4);
          const extras =
            s.exercises.length > 4 ? `+${s.exercises.length - 4}` : null;
          const dur = s.duration ? formatDuration(s.duration) : null;
          return (
            <div className="history-item" key={s.id}>
              <div className="history-header">
                <div className="history-name">{s.name}</div>
                <div className="history-date">
                  {longDate(s.date)}
                  {dur ? ` · ${dur}` : ''}
                </div>
              </div>
              <div className="history-exercises">
                {names.map((n, i) => (
                  <span className="history-tag" key={i}>
                    {n}
                  </span>
                ))}
                {extras && <span className="history-tag">{extras}</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
