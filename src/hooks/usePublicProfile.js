import { useCallback, useState } from 'react';
import { doc, getDoc, setDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Manages the public profile and username reservation.
 *
 * Firestore collections used:
 *   usernames/{username}     → { uid }          (uniqueness map)
 *   publicProfiles/{uid}     → { username, displayName, joinedAt, updatedAt }
 *
 * @param {string|null} uid  Current user's Firebase uid.
 */
export function usePublicProfile(uid) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // null = not checked

  /** Check if a username is available (or already owned by this user). */
  const checkUsername = useCallback(
    async (username) => {
      if (!username || username.length < 3) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      try {
        const snap = await getDoc(doc(db, 'usernames', username));
        setAvailable(!snap.exists() || snap.data().uid === uid);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    },
    [uid],
  );

  /**
   * Atomically claim a username and create/update the public profile.
   * If `oldUsername` is provided and differs, the old reservation is deleted.
   */
  const claimUsername = useCallback(
    async (username, displayName, oldUsername) => {
      if (!uid) throw new Error('Not signed in');

      await runTransaction(db, async (tx) => {
        // ── reads first (Firestore requirement) ──
        const newRef = doc(db, 'usernames', username);
        const newSnap = await tx.get(newRef);
        const profileRef = doc(db, 'publicProfiles', uid);
        const profileSnap = await tx.get(profileRef);

        if (newSnap.exists() && newSnap.data().uid !== uid) {
          throw new Error('Username is already taken');
        }

        // ── writes ──
        if (oldUsername && oldUsername !== username) {
          tx.delete(doc(db, 'usernames', oldUsername));
        }

        tx.set(newRef, { uid });

        const profileData = {
          username,
          displayName: displayName || username,
          updatedAt: new Date().toISOString(),
        };
        if (!profileSnap.exists()) {
          profileData.joinedAt = new Date().toISOString();
        }
        tx.set(profileRef, profileData, { merge: true });
      });
    },
    [uid],
  );

  /** Update only the display name on the public profile. */
  const updateDisplayName = useCallback(
    async (displayName) => {
      if (!uid) return;
      await setDoc(
        doc(db, 'publicProfiles', uid),
        { displayName, updatedAt: new Date().toISOString() },
        { merge: true },
      );
    },
    [uid],
  );

  /** Best-effort cleanup of username + publicProfile docs (for account deletion). */
  const deletePublicData = useCallback(
    async (username) => {
      if (!uid) return;
      try {
        if (username) await deleteDoc(doc(db, 'usernames', username));
      } catch { /* best-effort */ }
      try {
        await deleteDoc(doc(db, 'publicProfiles', uid));
      } catch { /* best-effort */ }
    },
    [uid],
  );

  return {
    checkUsername,
    claimUsername,
    updateDisplayName,
    deletePublicData,
    checking,
    available,
    setAvailable,
  };
}
