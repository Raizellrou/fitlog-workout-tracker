import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

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

  /** Create a new account, set display name, and send a verification email. */
  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await sendEmailVerification(cred.user);
    return cred;
  };

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signOut = () => fbSignOut(auth);

  /** Re-send a verification email to the currently signed-in user. */
  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  /**
   * Refresh the current user object from Firebase so that `emailVerified`
   * reflects any changes made since sign-in (e.g. after clicking the link).
   */
  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // Spread into a plain object so React sees a new reference and re-renders.
      setUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
    }
  };

  /**
   * Permanently delete the account.
   * Re-authenticates first (Firebase requires recent sign-in for destructive ops).
   * Deletes the Firestore data document before removing the Auth user so that
   * the security rules (which require an auth'd user) can still apply during deletion.
   */
  const deleteAccount = async (password) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not signed in');
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    // Delete Firestore data first while the user is still authenticated
    await deleteDoc(doc(db, 'users', currentUser.uid, 'data', 'fitlog'));
    // Then delete the Auth account
    await deleteUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        resendVerification,
        reloadUser,
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
