import { useState } from 'react';
import {
  Dumbbell, Scale, Target, Bell, Ruler, LogOut, Check, Plus, Trash2, Download,
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
import { formatDuration, TODAY, kgToLb, lbToKg, cmToIn, inToCm, cmToFtIn } from '@/lib/format';
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
function ProfileSheet({ profile, units, onClose, onSave }) {
  const { showToast } = useToast();
  const imperial = units === 'imperial';

  const [sex, setSex] = useState(profile.sex || 'male');
  const [age, setAge] = useState(profile.age ?? '');
  // Display values in the user's chosen units; storage stays metric
  const [heightVal, setHeightVal] = useState(
    profile.heightCm ? (imperial ? String(cmToIn(profile.heightCm)) : String(profile.heightCm)) : '',
  );
  const [weightVal, setWeightVal] = useState(
    profile.weightKg ? (imperial ? String(kgToLb(profile.weightKg)) : String(profile.weightKg)) : '',
  );
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel || 'moderate');

  const save = () => {
    const a = parseInt(age, 10);
    const hRaw = parseFloat(heightVal);
    const wRaw = parseFloat(weightVal);
    if (!a || a <= 0) return showToast('Enter a valid age');
    if (!hRaw || hRaw <= 0) return showToast('Enter a valid height');
    if (!wRaw || wRaw <= 0) return showToast('Enter a valid weight');
    // Convert back to metric before saving
    const heightCm = imperial ? inToCm(hRaw) : hRaw;
    const weightKg = imperial ? lbToKg(wRaw) : wRaw;
    onSave({ sex, age: a, heightCm, weightKg, activityLevel });
  };

  const metrics = [
    ['Age',    age,       setAge,       'yrs'],
    ['Height', heightVal, setHeightVal, imperial ? 'in' : 'cm'],
    ['Weight', weightVal, setWeightVal, imperial ? 'lb' : 'kg'],
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
                type="number" min="0" inputMode="decimal" placeholder="0"
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
function GoalSheet({ profile, goal, units, onClose, onSave }) {
  const imperial = units === 'imperial';
  const [type, setType] = useState(goal.type || 'lean_bulk');
  const [targetVal, setTargetVal] = useState(
    goal.targetWeightKg
      ? String(imperial ? kgToLb(goal.targetWeightKg) : goal.targetWeightKg)
      : '',
  );
  const [proteinPerLb, setProteinPerLb] = useState(goal.proteinPerLb ?? 1.0);

  const targetKg = parseFloat(targetVal)
    ? (imperial ? lbToKg(parseFloat(targetVal)) : parseFloat(targetVal))
    : null;

  const draft = { type, targetWeightKg: targetKg, proteinPerLb };
  const preview = computeNutritionTargets(profile, draft);

  const stepProtein = (d) =>
    setProteinPerLb((v) =>
      Math.round(Math.min(PROTEIN_PER_LB_MAX, Math.max(PROTEIN_PER_LB_MIN, v + d)) * 100) / 100,
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
          value={targetVal}
          onChange={(e) => setTargetVal(e.target.value)}
        />
        <span className="text-xs text-faint pl-1">{imperial ? 'lb' : 'kg'}</span>
      </div>

      {/* Protein anchor */}
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

// ── Log Weight sheet ─────────────────────────────────────────────────────────
function LogWeightSheet({ currentKg, units, onClose, onSave }) {
  const { showToast } = useToast();
  const imperial = units === 'imperial';
  const [val, setVal] = useState(
    currentKg ? String(imperial ? kgToLb(currentKg) : currentKg) : '',
  );

  const save = () => {
    const raw = parseFloat(val);
    if (!raw || raw <= 0) return showToast('Enter a valid weight');
    const kg = imperial ? lbToKg(raw) : raw;
    onSave(kg);
  };

  return (
    <BottomSheet
      title="Log Weight"
      onClose={onClose}
      footer={<GradientButton onClick={save}>Save Weight</GradientButton>}
    >
      <label className="block text-[13px] font-medium text-muted mb-2">Today&apos;s weight</label>
      <div className="flex items-center rounded-xl bg-surface-2 border border-white/5 px-3.5 mb-4 focus-within:border-accent/50 transition-colors">
        <input
          className="w-full bg-transparent py-3 text-[15px] text-ink outline-none tnum"
          type="number" min="0" inputMode="decimal" placeholder="0"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <span className="text-xs text-faint pl-1">{imperial ? 'lb' : 'kg'}</span>
      </div>
      <p className="text-[12px] text-faint">
        Saving updates your profile weight and recalculates calorie targets.
      </p>
    </BottomSheet>
  );
}

// ── Delete Account sheet ─────────────────────────────────────────────────────
function DeleteAccountSheet({ isGoogle, onClose, onConfirm }) {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!isGoogle && !password) return showToast('Enter your password to confirm');
    setBusy(true);
    try {
      await onConfirm(isGoogle ? undefined : password);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') { setBusy(false); return; }
      showToast(
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'Incorrect password.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many attempts — try again later.'
            : 'Could not delete account. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      title="Delete Account"
      onClose={onClose}
      footer={
        <button
          onClick={confirm}
          disabled={busy}
          className="w-full rounded-full bg-danger/15 border border-danger/40 text-danger font-semibold py-3.5 text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {busy ? 'Deleting…' : 'Permanently Delete My Account'}
        </button>
      }
    >
      <div className="rounded-xl bg-danger/10 border border-danger/25 px-3.5 py-3 text-[13px] text-danger mb-5">
        This permanently deletes your account and all synced data. This action
        cannot be undone.
      </div>
      {isGoogle ? (
        <p className="text-[13px] text-muted">
          You will be asked to sign in with Google to confirm your identity before
          the deletion proceeds.
        </p>
      ) : (
        <>
          <label className="block text-[13px] font-medium text-muted mb-2">
            Enter your password to confirm
          </label>
          <input
            className="w-full rounded-xl bg-surface-2 border border-white/5 px-4 py-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-danger/50 transition-colors"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}
    </BottomSheet>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function SettingsScreen({ state, update }) {
  const { user, signOut, deleteAccount } = useAuth();
  const { showToast } = useToast();

  const profile = state.profile ?? emptyProfile();
  const goal    = state.goal    ?? emptyGoal();
  const units   = state.units   ?? 'metric';
  const imperial = units === 'imperial';

  const targets = computeNutritionTargets(profile, goal);
  const goalDef = GOAL_TYPES.find((g) => g.id === goal.type) ?? GOAL_TYPES[0];

  const [profileOpen,      setProfileOpen]      = useState(false);
  const [goalOpen,         setGoalOpen]         = useState(false);
  const [weightOpen,       setWeightOpen]        = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Weight log — sorted newest first, show last 4
  const weightLog       = state.weightLog ?? [];
  const sortedWeightLog = [...weightLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  // Display helpers
  const displayWeight = (kg) =>
    imperial ? `${kgToLb(kg)} lb` : `${kg} kg`;
  const displayHeight = (cm) =>
    imperial ? cmToFtIn(cm) : `${cm} cm`;

  const name    = user?.displayName || user?.email?.split('@')[0] || 'Athlete';
  const initial = name.charAt(0).toUpperCase();

  const profileSummary = profileComplete(profile)
    ? `${cap(profile.sex)} · ${profile.age} yrs · ${displayWeight(profile.weightKg)}`
    : 'Tap Edit to set up your profile';

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  const saveWeight = (kg) => {
    update((s) => ({
      ...s,
      weightLog: [...(s.weightLog ?? []), { id: crypto.randomUUID(), date: TODAY, kg }],
      profile:   { ...(s.profile ?? emptyProfile()), weightKg: kg },
    }));
    setWeightOpen(false);
    showToast('Weight logged ✓');
  };

  const toggleUnits = () => {
    update((s) => ({ ...s, units: (s.units ?? 'metric') === 'metric' ? 'imperial' : 'metric' }));
  };

  const toggleNotifications = async (val) => {
    if (val) {
      if (!('Notification' in window)) {
        return showToast('Notifications not supported in this browser');
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return showToast('Notification permission denied');
      }
    }
    update((s) => ({ ...s, notificationsEnabled: val }));
  };

  const exportData = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `fitlog-export-${TODAY}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported ✓');
    } catch {
      showToast('Export failed — try again');
    }
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

        {/* Goal settings */}
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
              {goal.targetWeightKg
                ? `Target ${displayWeight(goal.targetWeightKg)}`
                : 'Set'}
            </span>
          }
          onClick={() => setGoalOpen(true)}
        />

        {/* Activity history */}
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
        </div>

        {/* Body Weight log */}
        <SectionTitle>Body Weight</SectionTitle>
        <div className="flex flex-col gap-2">
          <ListRow
            icon={
              <span className="grid place-items-center w-full h-full">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </span>
            }
            title="Log Today's Weight"
            onClick={() => setWeightOpen(true)}
            trailing={<span className="text-sm text-muted">+</span>}
          />
          {sortedWeightLog.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-6 text-center text-sm text-muted">
              No weight entries yet.
            </div>
          ) : (
            sortedWeightLog.map((entry, i) => {
              const prev = sortedWeightLog[i + 1];
              const deltaKg = prev ? Math.round((entry.kg - prev.kg) * 10) / 10 : null;
              const deltaDisplay = deltaKg != null
                ? `${deltaKg > 0 ? '+' : ''}${imperial ? kgToLb(Math.abs(deltaKg)) * (deltaKg < 0 ? -1 : 1) : deltaKg} ${imperial ? 'lb' : 'kg'} vs prev`
                : 'First entry';
              return (
                <ListRow
                  key={entry.id}
                  icon={<Scale className="w-5 h-5" strokeWidth={1.9} />}
                  title={displayWeight(entry.kg)}
                  subtitle={deltaDisplay}
                  trailing={<span className="text-sm text-muted">{weekday(entry.date)}</span>}
                />
              );
            })
          )}
        </div>

        {/* Settings */}
        <SectionTitle>Settings</SectionTitle>
        <div className="flex flex-col gap-2">
          <ListRow
            icon={<Bell className="w-5 h-5" strokeWidth={1.9} />}
            title="Notifications"
            subtitle={
              state.notificationsEnabled
                ? 'Workout reminders enabled'
                : 'Tap to enable workout reminders'
            }
            trailing={
              <Toggle
                checked={state.notificationsEnabled ?? false}
                onChange={toggleNotifications}
              />
            }
          />
          <ListRow
            icon={<Ruler className="w-5 h-5" strokeWidth={1.9} />}
            title="Units"
            subtitle={imperial ? 'Imperial (lb / in)' : 'Metric (kg / cm)'}
            trailing={
              <button
                onClick={toggleUnits}
                className="rounded-full bg-surface-2 border border-white/8 px-3.5 py-1.5 text-sm font-medium text-ink active:scale-[0.97] transition-transform"
              >
                {imperial ? 'kg/cm' : 'lb/in'}
              </button>
            }
          />
          <ListRow
            icon={<Download className="w-5 h-5" strokeWidth={1.9} />}
            title="Export My Data"
            subtitle="Download all data as JSON"
            onClick={exportData}
          />
          <ListRow
            icon={<LogOut className="w-5 h-5 text-danger" strokeWidth={1.9} />}
            title={<span className="text-danger">Logout</span>}
            onClick={signOut}
          />
          <ListRow
            icon={<Trash2 className="w-5 h-5 text-danger" strokeWidth={1.9} />}
            title={<span className="text-danger">Delete Account</span>}
            subtitle="Permanently removes all data"
            onClick={() => setDeleteAccountOpen(true)}
          />
        </div>
      </AppScreen>

      {profileOpen && (
        <ProfileSheet
          profile={profile}
          units={units}
          onClose={() => setProfileOpen(false)}
          onSave={saveProfile}
        />
      )}
      {goalOpen && (
        <GoalSheet
          profile={profile}
          goal={goal}
          units={units}
          onClose={() => setGoalOpen(false)}
          onSave={saveGoal}
        />
      )}
      {weightOpen && (
        <LogWeightSheet
          currentKg={profile.weightKg}
          units={units}
          onClose={() => setWeightOpen(false)}
          onSave={saveWeight}
        />
      )}
      {deleteAccountOpen && (
        <DeleteAccountSheet
          isGoogle={user?.providerData?.some((p) => p.providerId === 'google.com')}
          onClose={() => setDeleteAccountOpen(false)}
          onConfirm={async (pw) => {
            await deleteAccount(pw);
          }}
        />
      )}
    </>
  );
}
