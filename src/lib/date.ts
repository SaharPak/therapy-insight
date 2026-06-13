/** Local YYYY-MM-DD for a given date (defaults to today). */
export function isoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function friendlyToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Convert epoch millis to the value an <input type="date"> expects. */
export function toDateInputValue(ts: number): string {
  return isoDate(new Date(ts));
}

/** Parse an <input type="date"> value back into epoch millis (local noon). */
export function fromDateInputValue(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}
