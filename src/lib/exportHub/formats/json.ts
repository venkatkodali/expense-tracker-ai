import { getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";

export function buildJson(expenses: Expense[]): string {
  const payload = expenses.map((e) => ({
    date: e.date,
    category: getCategoryLabel(e.category),
    amount: e.amount,
    description: e.description,
  }));
  return JSON.stringify(payload, null, 2);
}
