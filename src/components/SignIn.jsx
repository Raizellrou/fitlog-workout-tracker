import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import GradientButton from '@/components/ui/GradientButton';

export default function SignIn() {
  const { signInWithGoogle, signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : err.code === 'auth/email-already-in-use'
            ? 'Email already in use. Try signing in.'
            : err.code === 'auth/weak-password'
              ? 'Password must be at least 6 characters.'
              : err.code === 'auth/invalid-email'
                ? 'Invalid email address.'
                : err.code === 'auth/network-request-failed'
                  ? 'Network error. Check your connection.'
                  : 'Something went wrong. Try again.';
      showToast(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(
          err.code === 'auth/network-request-failed'
            ? 'Network error. Check your connection.'
            : 'Google sign-in failed. Try again.',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
      <div className="text-[64px] font-bold leading-none text-gradient mb-3">FitLog</div>
      <p className="text-sm text-muted leading-relaxed max-w-[280px] mb-8">
        Track your workouts, nutrition, and progress — synced across all your devices.
      </p>

      <div className="w-full max-w-[320px]">
        {/* Email / Password form */}
        <form onSubmit={handleEmail} className="flex flex-col gap-3 mb-5">
          <input
            className="w-full rounded-xl bg-surface-2 border border-white/5 px-4 py-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-accent/50 transition-colors"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl bg-surface-2 border border-white/5 px-4 py-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-accent/50 transition-colors"
            type="password"
            placeholder="Password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <GradientButton type="submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </GradientButton>
        </form>

        <button
          onClick={() => setIsSignUp((v) => !v)}
          className="text-sm text-accent mb-6 active:opacity-70 transition-opacity"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-faint uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-surface-2 border border-white/8 py-3.5 text-sm font-medium text-ink active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
