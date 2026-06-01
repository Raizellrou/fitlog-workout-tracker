import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled' : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">FitLog</div>
      <p className="auth-sub">
        Log workouts and nutrition, synced across all your devices. Sign in to
        get started.
      </p>
      <button className="cta-btn" style={{ maxWidth: 280 }} onClick={handleSignIn} disabled={busy}>
        {busy ? 'Signing in…' : 'Continue with Google'}
      </button>
    </div>
  );
}
