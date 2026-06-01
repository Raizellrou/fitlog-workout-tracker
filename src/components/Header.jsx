import { headerDate } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

const TAB_TITLES = { workout: 'WORKOUT', food: 'NUTRITION', cardio: 'CARDIO', history: 'HISTORY' };

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header({ tab }) {
  const { isAuthenticated, user, signOut } = useAuth();
  const label = user?.displayName || user?.email || 'Account';
  return (
    <div className="header">
      <div className="header-top">
        <div className="logo">FitLog</div>
        <div className="header-actions">
          <div className="date-badge">{headerDate()}</div>
          {isAuthenticated && (
            <button
              className="icon-btn"
              onClick={signOut}
              title={`Sign out (${label})`}
              aria-label="Sign out"
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </div>
      <div className="page-title">{TAB_TITLES[tab]}</div>
    </div>
  );
}
