/** Format a number as USD currency, e.g. 1234.5 -> "$1,234.50". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Format an ISO date string ("2026-03-14") as "Mar 14, 2026". */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** Format a Date as an ISO "yyyy-MM-dd" string in local time (no UTC shift). */
export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-03" style bucket key for grouping by month, from an ISO date string. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "2026-03" -> "Mar 2026" */
export function formatMonthKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(d);
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
