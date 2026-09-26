import { getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { downloadTextFile } from "../download";

export interface ExportedExpenseJson {
  date: string;
  category: string;
  amount: number;
  description: string;
}

export function buildJson(expenses: Expense[]): string {
  const payload: ExportedExpenseJson[] = expenses.map((e) => ({
    date: e.date,
    category: getCategoryLabel(e.category),
    amount: e.amount,
    description: e.description,
  }));
  return JSON.stringify(payload, null, 2);
}

export function downloadJson(expenses: Expense[], filename: string): void {
  downloadTextFile(buildJson(expenses), "application/json;charset=utf-8;", filename);
}
