import { z } from "zod";
import { CATEGORY_IDS } from "./categories";
import type { Expense } from "./types";

export const STORAGE_KEY = "expense-tracker:expenses:v1";

const storedExpenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  category: z.enum(CATEGORY_IDS as [string, ...string[]]),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const storedExpensesSchema = z.array(storedExpenseSchema);

/**
 * Reads and validates the expense list from localStorage.
 * Never throws: returns an empty list (and logs) on any corruption.
 */
export function loadExpenses(): { expenses: Expense[]; error: string | null } {
  if (typeof window === "undefined") return { expenses: [], error: null };

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { expenses: [], error: null };

  try {
    const parsed = JSON.parse(raw);
    const result = storedExpensesSchema.safeParse(parsed);
    if (!result.success) {
      console.warn("Stored expense data failed validation, ignoring it.", result.error);
      return { expenses: [], error: "Saved data was corrupted and could not be loaded." };
    }
    return { expenses: result.data as Expense[], error: null };
  } catch (err) {
    console.warn("Stored expense data is not valid JSON, ignoring it.", err);
    return { expenses: [], error: "Saved data was corrupted and could not be loaded." };
  }
}

/**
 * Persists the expense list to localStorage.
 * Returns an error message on failure (e.g. quota exceeded, private mode).
 */
export function saveExpenses(expenses: Expense[]): { error: string | null } {
  if (typeof window === "undefined") return { error: null };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return { error: null };
  } catch (err) {
    console.error("Failed to save expenses to localStorage", err);
    return { error: "Couldn't save your changes. Your browser storage may be full." };
  }
}
