import { useState, useEffect, useRef } from 'react';
import { AtSign, Check, X, Loader2, User } from 'lucide-react';
import GradientButton from '@/components/ui/GradientButton';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useToast } from '@/context/ToastContext';
import { isValidUsername } from '@/lib/fitlog';

/**
 * Full-screen onboarding prompt shown once after sign-up (or upgrade)
 * when the user has no username set yet.
 */
export default function UsernameSetup({ uid, onComplete }) {
  const { checkUsername, claimUsername, checking, available, setAvailable } =
    usePublicProfile(uid);
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  // Debounced availability check
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setAvailable(null);
    const val = username.trim();
    if (!isValidUsername(val)) return;
    debounceRef.current = setTimeout(() => checkUsername(val), 400);
    return () => clearTimeout(debounceRef.current);
  }, [username, checkUsername, setAvailable]);

  const handleChange = (e) => {
    // Force lowercase, strip invalid chars
    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  };

  const handleSubmit = async () => {
    const u = username.trim();
    if (!isValidUsername(u)) {
      return showToast('3–20 chars: letters, numbers, underscores');
    }
    if (available === false) return showToast('Username is taken');

    const dn = displayName.trim() || u;
    setSaving(true);
    try {
      await claimUsername(u, dn);
      onComplete(u, dn);
    } catch (err) {
      showToast(err.message || 'Could not claim username — try another');
    } finally {
      setSaving(false);
    }
  };

  const valid = isValidUsername(username.trim());

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-grid place-items-center w-16 h-16 rounded-2xl accent-gradient text-white mb-4">
            <User className="w-8 h-8" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">Set Up Your Profile</h1>
          <p className="text-sm text-muted">
            Choose a username so friends can find you.
          </p>
        </div>

        {/* Username */}
        <label className="block text-[13px] font-medium text-muted mb-2">
          Username
        </label>
        <div className="flex items-center rounded-xl bg-surface border border-white/8 px-3 mb-1 focus-within:border-accent/50 transition-colors">
          <AtSign className="w-4 h-4 text-faint shrink-0" strokeWidth={2} />
          <input
            className="flex-1 bg-transparent py-3 px-2 text-[15px] text-ink outline-none placeholder:text-faint"
            placeholder="your_username"
            autoFocus
            value={username}
            onChange={handleChange}
            maxLength={20}
          />
          {checking && (
            <Loader2 className="w-4 h-4 text-muted animate-spin shrink-0" />
          )}
          {!checking && available === true && valid && (
            <Check className="w-4 h-4 text-success shrink-0" strokeWidth={2.5} />
          )}
          {!checking && available === false && valid && (
            <X className="w-4 h-4 text-danger shrink-0" strokeWidth={2.5} />
          )}
        </div>
        <p className="text-[11px] text-faint mb-5">
          {!valid && username.length > 0
            ? '3–20 characters: letters, numbers, underscores only'
            : available === false
              ? 'This username is taken'
              : 'Unique handle for your profile'}
        </p>

        {/* Display name */}
        <label className="block text-[13px] font-medium text-muted mb-2">
          Display Name
        </label>
        <div className="rounded-xl bg-surface border border-white/8 px-3 mb-8 focus-within:border-accent/50 transition-colors">
          <input
            className="w-full bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-faint"
            placeholder="Your Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
          />
        </div>

        <GradientButton onClick={handleSubmit}>
          {saving ? 'Setting up…' : 'Get Started'}
        </GradientButton>
      </div>
    </div>
  );
}
