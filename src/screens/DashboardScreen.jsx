import { Dumbbell, EyeOff, Target } from 'lucide-react';
import { kgToLb, cmToFtIn } from '@/lib/format';
import AppScreen from '@/components/ui/AppScreen';
import TopBar from '@/components/ui/TopBar';
import Card from '@/components/ui/Card';
import StatPill from '@/components/ui/StatPill';
import ScoreRing from '@/components/ui/ScoreRing';
import ProgressBar from '@/components/ui/ProgressBar';
import NoticeCard from '@/components/ui/NoticeCard';
import { useToast } from '@/context/ToastContext';
import {
  macroTotals, activeDays, lastWorkoutIso, computeNutritionTargets,
  weightDelta, consistencyScore, consistencyTrend,
} from '@/lib/fitlog';

export default function DashboardScreen({ state }) {
  const { showToast } = useToast();
  const profile = state.profile ?? {};

  // Goal-driven targets (null until the profile is filled in → fall back to 2400)
  const targets = computeNutritionTargets(profile, state.goal);
  const calorieGoal = targets?.calories ?? 2400;
  const totals = macroTotals(state.meals);
  const cal = Math.round(totals.cal);
  const intakePct = Math.round((cal / calorieGoal) * 100);

  // Units
  const units    = state.units ?? 'metric';
  const imperial = units === 'imperial';

  // Consistency Score — real formula (frequency 50%, streak 25%, recovery 15%, cardio 10%)
  const trend      = consistencyTrend(state);
  const csScore    = trend[trend.length - 1];          // = consistencyScore(state)
  const csPrev     = trend[trend.length - 2] ?? null;
  const csDelta    = csPrev != null ? csScore - csPrev : null;

  // Weight trend delta from the log (e.g. "+0.5 kg" or "-0.3 kg")
  const wDelta = weightDelta(state.weightLog ?? []);
  const wDeltaLabel = wDelta != null
    ? `${wDelta > 0 ? '+' : ''}${wDelta} kg`
    : null;

  // Weight display (units-aware)
  const heightDisplay = profile.heightCm
    ? (imperial ? cmToFtIn(profile.heightCm) : `${profile.heightCm} cm`)
    : '—';
  const weightDisplay = profile.weightKg
    ? (imperial ? `${kgToLb(profile.weightKg)} lb` : `${profile.weightKg} kg`)
    : '—';

  // Weight-to-goal (real if both current + target weight are set)
  const targetW    = state.goal?.targetWeightKg;
  const toGoKg     = targetW && profile.weightKg
    ? Math.round((profile.weightKg - targetW) * 10) / 10
    : null;
  // Display toGo in the user's preferred unit
  const toGo       = toGoKg != null
    ? (imperial ? Math.round(Math.abs(toGoKg) * 2.20462 * 10) / 10 : Math.abs(toGoKg))
    : null;
  const unitLabel  = imperial ? 'lb' : 'kg';
  const targetWDisplay = targetW
    ? (imperial ? `${kgToLb(targetW)} lb` : `${targetW} kg`)
    : null;

  // Real-ish: distinct workout days in the last 7
  const daysActive = activeDays(state.history, 7);
  const consistent = daysActive >= 3;

  // Real-ish: has any workout been logged in the last ~2 days?
  const last = lastWorkoutIso(state.history);
  const restingTooLong =
    !last || (Date.now() - new Date(last + 'T00:00:00').getTime()) / 86_400_000 > 2;

  return (
    <>
      <AppScreen>
        <TopBar title="Dashboard" onBell={() => showToast('No new notifications')} hasUnread />

        {/* ── Hero card ── */}
        <Card className="mb-4">
          {/* Height / Weight — from the user's profile (Settings → Edit) */}
          <div className="flex gap-3 mb-5">
            <StatPill label="Height" value={heightDisplay} />
            <StatPill label="Weight" value={weightDisplay} sub={wDeltaLabel} />
          </div>

          {/* Consistency Score — REAL (frequency · streak · recovery · cardio) */}
          <ScoreRing score={csScore} delta={csDelta} trendPoints={trend} />

          <div className="h-px bg-white/6 my-5" />

          {/* Today's Intake — REAL (from logged meals) */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[17px] font-semibold text-ink">Today&apos;s Intake</span>
            <span className="text-sm font-semibold text-ink tnum">{intakePct}%</span>
          </div>
          <div className="text-sm text-muted mb-3 tnum">
            {cal.toLocaleString()} kcal / {calorieGoal.toLocaleString()} goal
          </div>
          <ProgressBar value={cal} max={calorieGoal} />
          <div className="text-xs text-muted mt-3 tnum">
            {targets
              ? `Protein ${Math.round(totals.p)}/${targets.protein}g · Carbs ${Math.round(totals.c)}/${targets.carbs}g · Fat ${Math.round(totals.f)}/${targets.fat}g`
              : `Macro Breakdown: P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g F:${Math.round(totals.f)}g`}
          </div>
        </Card>

        {/* ── Gym Consistency (featured) ── */}
        <div className="relative mb-4 rounded-[22px] p-[1px] accent-gradient glow-accent">
          <div className="flex items-center gap-3 rounded-[21px] bg-surface px-4 py-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent-soft text-accent shrink-0">
              <Dumbbell className="w-5 h-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] tracking-wide text-muted uppercase">Gym Consistency</div>
              <div className="text-[15px] font-bold text-ink">
                {consistent ? 'CONSISTENT' : 'BUILDING'}{' '}
                <span className="font-medium text-muted">({daysActive} days active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Notices ── */}
        {restingTooLong && (
          <div className="mb-3">
            <NoticeCard
              tone="neutral"
              icon={<EyeOff className="w-5 h-5" strokeWidth={1.75} />}
              onDismiss={() => showToast('Dismissed')}
            >
              Rest detected — no workouts logged lately.
            </NoticeCard>
          </div>
        )}

        {/* Real weight-to-goal progress (shown once a target weight is set) */}
        {toGoKg != null && toGoKg !== 0 && (
          <NoticeCard tone="neutral" icon={<Target className="w-5 h-5" strokeWidth={1.75} />}>
            <span className="text-ink font-semibold">{toGo} {unitLabel}</span> to{' '}
            {toGoKg > 0 ? 'lose' : 'gain'} to reach your {targetWDisplay} goal.
          </NoticeCard>
        )}
        {toGoKg === 0 && (
          <NoticeCard tone="neutral" icon={<Target className="w-5 h-5" strokeWidth={1.75} />}>
            You&apos;ve reached your goal weight 🎉
          </NoticeCard>
        )}
      </AppScreen>
    </>
  );
}
