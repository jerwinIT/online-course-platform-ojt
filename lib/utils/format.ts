/**
 * Formats duration in minutes to a human-readable string.
 * Examples: 20 → "20 min" | 60 → "1h" | 90 → "1h 30min" | 0 → "—"
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
