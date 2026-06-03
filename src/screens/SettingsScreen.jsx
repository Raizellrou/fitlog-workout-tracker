import { useState } from 'react';
import {
  Dumbbell, Scale, Target, Moon, Bell, Ruler, LogOut, ChevronDown, Check,
} from 'lucide-react';
import AppScreen from '@/components/ui/AppScreen';
import TopBar from '@/components/ui/TopBar';
import Card from '@/components/ui/Card';
import ListRow from '@/components/ui/ListRow';
import Toggle from '@/components/ui/Toggle';
import BottomSheet from '@/components/ui/BottomSheet';
import GradientButton from '@/components/ui/GradientButton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDuration } from '@/lib/format';
import {
  SEX_OPTIONS, ACTIVITY_LEVELS, emptyProfile, profileComplete,
  GOAL_TYPES, emptyGoal, computeNutritionTargets, PROTEIN_PER_LB_MIN, PROTEIN_PER_LB_MAX,
} from '@/lib/fitlog';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekday = (iso) => WD[new Date(iso + 'T00:00:00').getDay()];
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function SectionTitle({ children }) {
  return <h2 className="text-[18px] font-semibold text-ink mb-3 mt-6 first:mt-0">{children}</h2>;
}

// ── Edit Profile sheet ───────────────────────────────────────────────────────
function ProfileSheet({ profile, onClose, onSave }) {
  const { showToast } = useToast();
  const [sex, setSex] = useState(profile.sex || 'male');
  const [age, setAge] = useState(profile.age ?? '');
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? '');
  const [weightKg, setWeightKg] = useState(profile.weightKg ?? '');
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || 'moderate');

  const save = () => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!a || a <= 0) return showToast('Enter a valid age');
    if (!h || h <= 0) return showToast('Enter a valid height');
    if (!w || w <= 0) return showToast('Enter a valid weight');
    onSave({ sex, age: a, heightCm: h, weightKg: w, activityLevel });
  };

  const metrics = [
    ['Age', age, setAge, 'yrs'],
    ['Height', heightCm, setHeightCm, 'cm'],
    ['Weight', weightKg, setWeightKg, 'kg'],
  ];

  return (
    <BottomSheet
      title="Edit Profile"
      onClose={onClose}
      footer={<GradientButton onClick={save}>Save Profile</GradientButton>}
    >
      {/* Sex */}
      <label className="block text-[13px] font-medium text-muted mb-2">Sex</label>
      <div className="flex gap-2 mb-5">
        {SEX_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSex(s)}
            className={`flex-1 py-2.5 rounded-full text-[13px] font-medium capitalize transition-colors ${
              sex === s ? 'accent-gradient text-white' : 'bg-surface-2 border border-white/5 text-muted'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Age / Height / Weight */}
      <label className="block text-[13px] font-medium text-muted mb-2">Body metrics</label>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {metrics.map(([label, val, setter, unit]) => (
          <div key={label}>
            <span className="block text-[11px] text-muted mb-1.5">{label}</span>
            <div className="flex items-center rounded-xl bg-surface-2 border border-white/5 px-2.5 focus-within:border-accent/50 transition-colors">
              <input
                className="w-full min-w-0 bg-transparent py-3 text-[15px] text-ink outline-none tnum"
                type="number"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={val}
                onChange={(e) => setter(e.target.value)}
              />
              <span className="text-xs text-faint pl-1">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity level */}
      <label className="block text-[13px] font-medium text-muted mb-2">Activity level</label>
      <div className="flex flex-col gap-2">
        {ACTIVITY_LEVELS.map((a) => {
          const active = activityLevel === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setActivityLevel(a.id)}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors ${
                active ? 'bg-accent-soft border border-accent/40' : 'bg-surface-2 border border-white/5'
              }`}
            >
              <span>
                <span className={`block text-sm font-medium ${active ? 'text-accent-light' : 'text-ink'}`}>{a.label}</span>
                <span className="block text-[11px] text-muted">{a.sub}</span>
              </span>
              {active && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// ── Goal sheet (drives macro targets) ────────────────────────────────────────
function GoalSheet({ profile, goal, onClose, onSave }) {
  const [type, setType] = useState(goal.type || 'lean_bulk');
  const [targetWeightKg, setTargetWeightKg] = useState(goal.targetWeightKg ?? '');
  const [proteinPerLb, setProteinPerLb] = useState(goal.proteinPerLb ?? 1.0);

  const draft = { type, targetWeightKg: parseFloat(targetWeightKg) || null, proteinPerLb };
  const preview = computeNutritionTargets(profile, draft);

  const stepProtein = (d) =>
    setProteinPerLb((v) =>
      Math.round(Math.min(PROTEIN_PER_LB_MAX, Math.max(PROTEIN_PER_LB_MIN, v + d)) * 100) / 100
    );

  return (
    <BottomSheet
      title="Your Goal"
      onClose={onClose}
      footer={<GradientButton onClick={() => onSave(draft)}>Save Goal</GradientButton>}
    >
      {!profileComplete(profile) && (
        <div className="rounded-xl bg-surface-2 border border-white/5 px-3.5 py-3 text-[13px] text-muted mb-4">
          Set up your profile first so targets can be calculated.
        </div>
      )}

      {/* Goal type */}
      <label className="block text-[13px] font-medium text-muted mb-2">Goal</label>
      <div className="flex flex-col gap-2 mb-5">
        {GOAL_TYPES.map((g) => {
          const active = type === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setType(g.id)}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors ${
                active ? 'bg-accent-soft border border-accent/40' : 'bg-surface-2 border border-white/5'
              }`}
            >
              <span>
                <span className={`block text-sm font-medium ${active ? 'text-accent-light' : 'text-ink'}`}>{g.label}</span>
                <span className="block text-[11px] text-muted">{g.sub}</span>
              </span>
              <span className={`text-xs tnum ${active ? 'text-accent-light' : 'text-faint'}`}>
                {g.kcalDelta > 0 ? `+${g.kcalDelta}` : g.kcalDelta} kcal
              </span>
            </button>
          );
        })}
      </div>

      {/* Target weight */}
      <label className="block text-[13px] font-medium text-muted mb-2">Target weight</label>
      <div className="flex items-center rounded-xl bg-surface-2 border border-white/5 px-3.5 mb-5 focus-within:border-accent/50 transition-colors">
        <input
          className="w-full bg-transparent py-3 text-[15px] text-ink outline-none tnum"
          type="number" min="0" inputMode="decimal" placeholder="Optional"
          value={targetWeightKg}
          onChange={(e) => setTargetWeightKg(e.target.value)}
        />
        <span className="text-xs text-faint pl-1">kg</span>
      </div>

      {/* Protein anchor (Jacob Oestreicher: 0.8–1.0 g/lb) */}
      <label className="block text-[13px] font-medium text-muted mb-1">
        Protein <span className="text-faint">(the anchor — 0.8–1.0 g/lb)</span>
      </label>
      <div className="flex items-center justify-between rounded-xl bg-surface-2 border border-white/5 px-2 py-2 mb-5">
        <button onClick={() => stepProtein(-0.05)} className="grid place-items-center w-10 h-10 rounded-lg bg-surface border border-white/8 text-ink text-xl active:scale-95 transition-transform">−</button>
        <div className="text-center tnum">
          <div className="text-[18px] font-bold text-ink">{proteinPerLb.toFixed(2)} <span className="text-xs font-normal text-muted">g/lb</span></div>
          {preview && <div className="text-[11px] text-accent-light">= {preview.protein} g protein/day</div>}
        </div>
        <button onClick={() => stepProtein(0.05)} className="grid place-items-center w-10 h-10 rounded-lg bg-surface border border-white/8 text-ink text-xl active:scale-95 transition-transform">+</button>
      </div>

      {/* Live target preview */}
      {preview && (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[13px] text-muted">Daily target</span>
            <span className="text-[22px] font-bold text-accent-light tnum">{preview.calories} <span className="text-sm font-medium text-muted">kcal</span></span>
          </div>
          <div className="grid grid-cols-3 gap-2 tnum">
            {[['Protein', preview.protein], ['Carbs', preview.carbs], ['Fat', preview.fat]].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-surface py-2.5 text-center">
                <div className="text-[16px] font-bold text-ink">{v}g</div>
                <div className="text-[10px] text-muted uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-faint text-center mt-3 tnum">
            Maintenance ≈ {preview.tdee} kcal
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function SettingsScreen({ state, update }) {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const profile = state.profile ?? emptyProfile();
  const goal = state.goal ?? emptyGoal();
  const targets = computeNutritionTargets(profile, goal);
  const goalDef = GOAL_TYPES.find((g) => g.id === goal.type) ?? GOAL_TYPES[0];
  const [profileOpen, setProfileOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  // TODO: wire real data (these toggles/units are UI-only for now)
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const name = user?.displayName || user?.email?.split('@')[0] || 'Athlete';
  const initial = name.charAt(0).toUpperCase();

  const profileSummary = profileComplete(profile)
    ? `${cap(profile.sex)} · ${profile.age} yrs · ${profile.weightKg} kg`
    : 'Tap Edit to set up your profile';

  const saveProfile = (next) => {
    update((s) => ({ ...s, profile: { ...emptyProfile(), ...s.profile, ...next } }));
    setProfileOpen(false);
    showToast('Profile updated ✓');
  };

  const saveGoal = (next) => {
    update((s) => ({ ...s, goal: { ...emptyGoal(), ...s.goal, ...next } }));
    setGoalOpen(false);
    showToast('Goal updated ✓');
  };

  // Real: recent workouts from history
  const workouts = (state.history ?? []).slice(0, 4);

  return (
    <>
      <AppScreen>
        <TopBar title="Profile & History" variant="centered" />

        {/* Profile card */}
        <Card className="flex items-center gap-4 mb-2">
          <div className="grid place-items-center w-14 h-14 rounded-full accent-gradient text-white text-xl font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-bold text-ink truncate">{name}</div>
            <div className="text-sm text-muted truncate">{profileSummary}</div>
          </div>
          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-full bg-surface-2 border border-white/8 px-4 py-2 text-sm font-medium text-ink active:scale-[0.97] transition-transform"
          >
            Edit
          </button>
        </Card>

        {/* Goal settings — real, goal-driven macro targets */}
        <SectionTitle>Goal Settings</SectionTitle>
        <ListRow
          icon={<Target className="w-5 h-5" strokeWidth={1.9} />}
          title={goalDef.label}
          subtitle={
            targets
              ? `${targets.calories} kcal · P${targets.protein} C${targets.carbs} F${targets.fat}`
              : 'Set your profile to calculate targets'
          }
          trailing={
            <span className="text-sm text-muted">
              {goal.targetWeightKg ? `Target ${goal.targetWeightKg}kg` : 'Set'}
            </span>
          }
          onClick={() => setGoalOpen(true)}
        />

        {/* Activity history — real workouts (+ one mock weight entry to match design) */}
        <SectionTitle>Activity History</SectionTitle>
        <div className="flex flex-col gap-2">
          {workouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-muted">
              No activity logged yet.
            </div>
          ) : (
            workouts.map((w) => (
              <ListRow
                key={w.id}
                icon={<Dumbbell className="w-5 h-5" strokeWidth={1.9} />}
                title={`Workout: ${w.name}`}
                subtitle={w.duration ? formatDuration(w.duration) : 'Logged'}
                trailing={<span className="text-sm text-muted">{weekday(w.date)}</span>}
              />
            ))
          )}
          {/* TODO: wire real data (body-weight log — Phase 3) */}
          <ListRow
            icon={<Scale className="w-5 h-5" strokeWidth={1.9} />}
            title="Weight"
            subtitle="78.5 kg (-0.2kg)"
            trailing={<span className="text-sm text-muted">Tue</span>}
          />
        </div>

        {/* Settings */}
        <SectionTitle>Settings</SectionTitle>
        <div className="flex flex-col gap-2">
          <ListRow
            icon={<Moon className="w-5 h-5" strokeWidth={1.9} />}
            title="Dark Mode"
            trailing={<Toggle checked={darkMode} onChange={setDarkMode} />}
          />
          <ListRow
            icon={<Bell className="w-5 h-5" strokeWidth={1.9} />}
            title="Notifications"
            trailing={<Toggle checked={notifications} onChange={setNotifications} />}
          />
          <ListRow
            icon={<Ruler className="w-5 h-5" strokeWidth={1.9} />}
            title="Units"
            trailing={
              <span className="flex items-center gap-1 text-sm text-muted">
                kg/cm <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </span>
            }
          />
          <ListRow
            icon={<LogOut className="w-5 h-5 text-danger" strokeWidth={1.9} />}
            title={<span className="text-danger">Logout</span>}
            onClick={signOut}
          />
        </div>
      </AppScreen>

      {profileOpen && (
        <ProfileSheet profile={profile} onClose={() => setProfileOpen(false)} onSave={saveProfile} />
      )}
      {goalOpen && (
        <GoalSheet profile={profile} goal={goal} onClose={() => setGoalOpen(false)} onSave={saveGoal} />
      )}
    </>
  );
}
