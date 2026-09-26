import { getCategoryLabel } from "./categories";
import type { Expense } from "./types";

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    e.date,
    getCategoryLabel(e.category),
    e.amount.toFixed(2),
    e.description,
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\n");
}

export function downloadExpensesCsv(expenses: Expense[], filename = "expenses.csv"): void {
  const csv = expensesToCsv(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
