import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import GradientButton from '@/components/ui/GradientButton';

const ERROR_MESSAGES = {
  'auth/user-not-found': 'No account with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

function friendlyError(err) {
  return ERROR_MESSAGES[err?.code] ?? 'Something went wrong. Try again.';
}

const fieldClass =
  'w-full rounded-xl bg-surface-2 border border-white/8 px-3.5 py-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-accent/50 transition-colors';

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !name.trim()) return showToast('Enter your name');
    setBusy(true);
    try {
      if (isSignUp) await signUp(email, password, name.trim());
      else await signIn(email, password);
    } catch (err) {
      showToast(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
      <div className="text-[64px] font-bold leading-none text-gradient mb-3">FitLog</div>
      <p className="text-sm text-muted leading-relaxed max-w-[280px] mb-8">
        {isSignUp
          ? 'Create an account to sync your workouts across all your devices.'
          : 'Sign in to access your workouts and nutrition log.'}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-3">
        {isSignUp && (
          <input className={fieldClass} type="text" placeholder="Your name" value={name}
            onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={busy} />
        )}
        <input className={fieldClass} type="email" placeholder="you@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={busy} />
        <input className={fieldClass} type="password" placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
          value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'} disabled={busy} />
        <GradientButton type="submit" disabled={busy} className="mt-1">
          {busy ? (isSignUp ? 'Creating account…' : 'Signing in…') : isSignUp ? 'Create Account' : 'Sign In'}
        </GradientButton>
      </form>

      <button
        onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setName(''); setEmail(''); setPassword(''); }}
        className="mt-5 text-sm text-muted hover:text-ink transition-colors"
        disabled={busy}
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
      </button>
    </div>
  );
}
