import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { emptyState, freshDay } from '@/lib/fitlog';
import { TODAY } from '@/lib/format';

const CACHE_KEY = 'fitlog_v1';

/** Read the last-known state from localStorage (offline cache / instant paint). */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    // Merge over emptyState() so docs cached before a new field was added
    // still get sane defaults for that field (e.g. profile, goal, weightLog).
    return freshDay({ ...emptyState(), ...JSON.parse(raw) });
  } catch {
    return null;
  }
}

function writeCache(state) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode — non-fatal */
  }
}

/**
 * Single source of truth for all FitLog data.
 *
 * - Paints instantly from the localStorage cache.
 * - Subscribes to the user's Firestore doc for real-time multi-device sync.
 * - `update()` writes optimistically to local state + cache, then to Firestore.
 *
 * @param {string|null} uid  Firebase user id, or null when signed out.
 */
export function useFitlogData(uid) {
  const [state, setState] = useState(() => readCache() || emptyState());
  const [synced, setSynced] = useState(false);
  const hydratedRef = useRef(false);

  // Subscribe to Firestore for the signed-in user.
  useEffect(() => {
    if (!uid) {
      setSynced(false);
      return;
    }
    const ref = doc(db, 'users', uid, 'data', 'fitlog');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setSynced(true);
        if (snap.exists()) {
          const remote = freshDay({ ...emptyState(), ...snap.data() });
          setState(remote);
          writeCache(remote);
        } else {
          // First login on this account — seed the doc from local cache.
          const seed = readCache() || emptyState();
          setDoc(ref, seed).catch(() => {});
        }
        hydratedRef.current = true;
      },
      () => setSynced(false)
    );
    return unsub;
  }, [uid]);

  /** Apply a state change everywhere: React → cache → Firestore. */
  const update = useCallback(
    (updater) => {
      setState((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        writeCache(next);
        if (uid) {
          setDoc(doc(db, 'users', uid, 'data', 'fitlog'), next).catch(() => {});
        }
        return next;
      });
    },
    [uid]
  );

  return { state, update, synced, today: TODAY };
}
