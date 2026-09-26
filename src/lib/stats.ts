import type { CategoryId, CategoryInfo } from "./categories";
import type { Expense } from "./types";
import { formatMonthKey, monthKey } from "./utils";

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function previousMonthKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 2, 1); // month is 1-indexed; -2 = previous month, 0-indexed
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface CategoryTotal {
  category: CategoryId;
  label: string;
  colorVar: string;
  amount: number;
}

/**
 * Total spend per category, only categories with a nonzero total, sorted
 * descending. `categories` is the live registry (built-in + user-created);
 * an expense whose category id isn't in it (e.g. a custom category that was
 * since deleted) still shows up, labeled by its raw id and using the
 * neutral muted color, rather than silently disappearing from the totals.
 */
export function categoryTotals(expenses: Expense[], categories: CategoryInfo[]): CategoryTotal[] {
  const totals = new Map<CategoryId, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const unknownIds = Array.from(totals.keys()).filter((id) => !categoryMap.has(id));
  const allIds = [...categories.map((c) => c.id), ...unknownIds];

  return allIds
    .filter((id) => (totals.get(id) ?? 0) > 0)
    .map((id) => {
      const info = categoryMap.get(id);
      return {
        category: id,
        label: info?.label ?? id,
        colorVar: info?.colorVar ?? "--cat-muted",
        amount: totals.get(id) ?? 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyTotal {
  key: string;
  label: string;
  amount: number;
}

/** Total spend bucketed by month, chronological, capped to the last `limit` months present. */
export function monthlyTotals(expenses: Expense[], limit = 6): MonthlyTotal[] {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    const key = monthKey(e.date);
    totals.set(key, (totals.get(key) ?? 0) + e.amount);
  }
  const sortedKeys = Array.from(totals.keys()).sort();
  const lastKeys = sortedKeys.slice(-limit);
  return lastKeys.map((key) => ({ key, label: formatMonthKey(key), amount: totals.get(key) ?? 0 }));
}

export interface DashboardSummary {
  total: number;
  transactionCount: number;
  thisMonth: number;
  lastMonth: number;
  thisMonthDeltaPercent: number | null;
  topCategory: CategoryTotal | null;
}

export function computeSummary(expenses: Expense[], categories: CategoryInfo[]): DashboardSummary {
  const total = sumAmount(expenses);
  const thisKey = currentMonthKey();
  const lastKey = previousMonthKey(thisKey);
  const thisMonth = sumAmount(expenses.filter((e) => monthKey(e.date) === thisKey));
  const lastMonth = sumAmount(expenses.filter((e) => monthKey(e.date) === lastKey));
  const thisMonthDeltaPercent = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;
  const totals = categoryTotals(expenses, categories);

  return {
    total,
    transactionCount: expenses.length,
    thisMonth,
    lastMonth,
    thisMonthDeltaPercent,
    topCategory: totals[0] ?? null,
  };
}
