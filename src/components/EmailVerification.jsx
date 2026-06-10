import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import GradientButton from '@/components/ui/GradientButton';

/**
 * Shown when the signed-in user has not yet verified their email.
 * The Firestore rules block all reads/writes until email_verified = true,
 * so the app gates behind this screen.
 */
export default function EmailVerification() {
  const { user, signOut, resendVerification, reloadUser } = useAuth();
  const { showToast } = useToast();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      showToast('Verification email sent ✓');
    } catch (err) {
      showToast(err.code === 'auth/too-many-requests'
        ? 'Too many attempts — wait a moment before retrying.'
        : 'Could not send email. Try again.');
    } finally {
      setResending(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await reloadUser();
      // If emailVerified is now true, App.jsx will unmount this screen automatically.
      // If still false, let the user know.
      if (!user?.emailVerified) {
        showToast('Email not verified yet — check your inbox.');
      }
    } catch {
      showToast('Could not refresh. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-7 text-center gap-6">
      <div className="grid place-items-center w-20 h-20 rounded-full bg-accent-soft">
        <MailCheck className="w-9 h-9 text-accent" strokeWidth={1.75} />
      </div>

      <div>
        <h1 className="text-[24px] font-bold text-ink mb-2">Verify your email</h1>
        <p className="text-sm text-muted leading-relaxed max-w-[280px]">
          We sent a verification link to{' '}
          <span className="text-ink font-medium">{user?.email}</span>.
          Click the link, then come back here.
        </p>
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <GradientButton onClick={handleRefresh} disabled={checking}>
          {checking ? 'Checking…' : "I've verified — continue"}
        </GradientButton>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full rounded-full bg-surface-2 border border-white/8 py-3.5 text-sm font-semibold text-muted active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend verification email'}
        </button>
      </div>

      <button
        onClick={signOut}
        className="text-sm text-faint hover:text-muted transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
