import { useCallback, useEffect, useRef, useState } from 'react';

const TIMER_KEY = 'fitlog_timer_v1';

function readTimer() {
  try {
    return JSON.parse(localStorage.getItem(TIMER_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Session stopwatch. Kept in localStorage only (device-local, ticks every
 * second) so it never floods Firestore. Returns elapsed ms + controls.
 */
export function useTimer() {
  const saved = readTimer();
  const [running, setRunning] = useState(!!saved.running);
  const [elapsed, setElapsed] = useState(saved.elapsed || 0);
  const startRef = useRef(saved.running ? Date.now() - (saved.elapsed || 0) : null);
  const intervalRef = useRef(null);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify(next));
    } catch {
      /* non-fatal */
    }
  }, []);

  // Tick while running.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const toggle = useCallback(() => {
    setRunning((wasRunning) => {
      if (wasRunning) {
        const now = Date.now() - startRef.current;
        setElapsed(now);
        persist({ running: false, elapsed: now });
        return false;
      }
      startRef.current = Date.now() - elapsed;
      persist({ running: true, elapsed });
      return true;
    });
  }, [elapsed, persist]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    startRef.current = null;
    persist({ running: false, elapsed: 0 });
  }, [persist]);

  return { running, elapsed, toggle, reset };
}
