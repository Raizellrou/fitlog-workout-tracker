import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  function handleSignIn() {
    setBusy(true);
    // signInWithRedirect navigates away — no try/catch needed here.
    // If it fails, the user lands back on this screen automatically.
    signInWithGoogle();
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">FitLog</div>
      <p className="auth-sub">
        Log workouts and nutrition, synced across all your devices. Sign in to
        get started.
      </p>
      <button
        className="cta-btn"
        style={{ maxWidth: 280 }}
        onClick={handleSignIn}
        disabled={busy}
      >
        {busy ? 'Redirecting to Google…' : 'Continue with Google'}
      </button>
    </div>
  );
}
