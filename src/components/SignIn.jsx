import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

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

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && !name.trim()) {
      showToast('Enter your name');
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name.trim());
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      showToast(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">FitLog</div>
      <p className="auth-sub">
        {isSignUp
          ? 'Create an account to sync your workouts across all your devices.'
          : 'Sign in to access your workouts and nutrition log.'}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {isSignUp && (
          <div className="form-field">
            <div className="field-label">Name</div>
            <input
              className="field-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={busy}
            />
          </div>
        )}

        <div className="form-field">
          <div className="field-label">Email</div>
          <input
            className="field-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={busy}
          />
        </div>

        <div className="form-field">
          <div className="field-label">Password</div>
          <input
            className="field-input"
            type="password"
            placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            disabled={busy}
          />
        </div>

        <button
          className="cta-btn"
          type="submit"
          disabled={busy}
          style={{ marginTop: 4 }}
        >
          {busy
            ? isSignUp
              ? 'Creating account…'
              : 'Signing in…'
            : isSignUp
              ? 'CREATE ACCOUNT'
              : 'SIGN IN'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(isSignUp ? 'signin' : 'signup');
          setName('');
          setEmail('');
          setPassword('');
        }}
        style={{
          marginTop: 16,
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
        disabled={busy}
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : "Don't have an account? Create one"}
      </button>
    </div>
  );
}
