// src/lib/format.ts
export function formatDate(iso: string) {
  // Parse only the date portion (YYYY-MM-DD) as local time to avoid
  // UTC-midnight → previous-day shift in negative-offset timezones.
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
