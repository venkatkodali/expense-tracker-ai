import type { CategoryId } from "./categories";

export interface Expense {
  id: string;
  /** ISO date string, e.g. "2026-03-14" (no time component). */
  date: string;
  /** Amount in dollars, positive, up to 2 decimal places. */
  amount: number;
  category: CategoryId;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Pick<Expense, "date" | "amount" | "category" | "description">;

export type DatePreset = "all" | "this-month" | "last-30" | "last-90" | "custom";

export interface ExpenseFilters {
  search: string;
  categories: CategoryId[];
  preset: DatePreset;
  /** Only used when preset === "custom". ISO date strings. */
  dateFrom: string | null;
  dateTo: string | null;
}
