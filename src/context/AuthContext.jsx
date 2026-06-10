import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

const googleProvider = new GoogleAuthProvider();

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  /** Sign in (or sign up) with a Google popup. */
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signOut = () => fbSignOut(auth);

  /**
   * Permanently delete the account.
   * Re-authenticates via Google popup (Firebase requires recent sign-in for
   * destructive ops). Deletes Firestore data before removing the Auth user
   * so that security rules still apply during the Firestore delete.
   */
  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not signed in');
    await reauthenticateWithPopup(currentUser, googleProvider);
    await deleteDoc(doc(db, 'users', currentUser.uid, 'data', 'fitlog'));
    await deleteUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signInWithGoogle,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
