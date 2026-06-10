// ── Date & number formatting helpers ──

export const TODAY = new Date().toISOString().split('T')[0];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];
const MONTHS_TITLE = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function pad(n) {
  return String(n).padStart(2, '0');
}

/** "MON 1 JUN" badge in the header. */
export function headerDate(now = new Date()) {
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS_SHORT[now.getMonth()]}`;
}

/** "Jun 1, 2026" used in history rows. */
export function longDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return `${MONTHS_TITLE[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Format a stopwatch value (ms) → "5s" / "12m" / "1h 4m". */
export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

/** Live timer label: "00:42" or "1:02:03". */
export function timerLabel(elapsedMs) {
  const s = Math.floor(elapsedMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${pad(h)}:${pad(m % 60)}:${pad(s % 60)}`;
  return `${pad(m)}:${pad(s % 60)}`;
}

/** Compact volume: 1240 → "1.2k". */
export function compactVolume(volume) {
  return volume > 999 ? (volume / 1000).toFixed(1) + 'k' : String(Math.round(volume));
}

/** ISO date string for yesterday. */
export function yesterdayISO() {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return y.toISOString().split('T')[0];
}

// ── Unit conversion helpers ───────────────────────────────────────────────────
// Internal storage is always metric (kg, cm). These helpers only affect display
// and user input. Use lbToKg / inToCm when converting input back before saving.

/** kg → lb, 1 decimal place. */
export function kgToLb(kg) {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/** lb → kg, 2 decimal places. */
export function lbToKg(lb) {
  return Math.round((lb / 2.20462) * 100) / 100;
}

/** cm → whole inches (for input fields). */
export function cmToIn(cm) {
  return Math.round(cm / 2.54);
}

/** inches → cm, 1 decimal place. */
export function inToCm(inches) {
  return Math.round((inches * 2.54) * 10) / 10;
}

/** cm → "5'11"" display string. */
export function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn % 12);
  return `${ft}'${inch}"`;
}
