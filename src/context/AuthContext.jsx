import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
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

  /** Sign in with a Google popup. */
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  /** Sign in with email + password. */
  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  /** Create a new account with email + password. */
  const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signOut = () => fbSignOut(auth);

  /**
   * Permanently delete the account.
   * Re-authenticates via the provider that was used to sign in.
   * For Google users → popup re-auth. For email/password → credential re-auth.
   * Deletes Firestore data before removing the Auth user.
   */
  const deleteAccount = async (password) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not signed in');

    const isGoogle = currentUser.providerData.some(
      (p) => p.providerId === 'google.com',
    );

    if (isGoogle) {
      await reauthenticateWithPopup(currentUser, googleProvider);
    } else {
      const cred = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, cred);
    }

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
        signIn,
        signUp,
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
