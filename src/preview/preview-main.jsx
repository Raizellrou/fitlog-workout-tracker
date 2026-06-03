import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthContext } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import PreviewApp from './PreviewApp';
import '@/index.css';

// TEMP preview entry (not shipped). Uses a mock auth value instead of the real
// AuthProvider so Firebase never opens a live connection (which blocks the
// screenshot renderer). The rendered screens/components are identical.
const mockAuth = {
  user: { displayName: 'Alex R.', email: 'alex@example.com' },
  loading: false,
  isAuthenticated: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: () => {},
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContext.Provider value={mockAuth}>
      <ToastProvider>
        <PreviewApp />
      </ToastProvider>
    </AuthContext.Provider>
  </StrictMode>
);
