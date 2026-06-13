/**
 * Date helpers. The display locale is set by the language layer via
 * setDateLocale(); Farsi uses "fa-IR-u-ca-persian" so dates render on the
 * Persian (Jalali) calendar with Farsi month names and numerals.
 */

let currentLocale: string | undefined = undefined;

export function setDateLocale(locale: string | undefined): void {
  currentLocale = locale;
}

/** Local YYYY-MM-DD (Gregorian) for storage / <input type="date"> (defaults to today). */
export function isoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(currentLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(ts: number): string {
  return new Date(ts).toLocaleDateString(currentLocale, {
    month: "long",
    year: "numeric",
  });
}

export function friendlyToday(): string {
  return new Date().toLocaleDateString(currentLocale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Convert epoch millis to the value an <input type="date"> expects (Gregorian). */
export function toDateInputValue(ts: number): string {
  return isoDate(new Date(ts));
}

/** Parse an <input type="date"> value back into epoch millis (local noon). */
export function fromDateInputValue(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}
