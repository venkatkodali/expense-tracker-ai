import type { Expense } from "./types";

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** `getLabel` resolves a category id to its display label (built-in or custom). */
export function expensesToCsv(expenses: Expense[], getLabel: (id: string) => string): string {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    getLabel(e.category),
    e.description,
    e.amount.toFixed(2),
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\n");
}

export function downloadExpensesCsv(
  expenses: Expense[],
  getLabel: (id: string) => string,
  filename = "expenses.csv",
): void {
  const csv = expensesToCsv(expenses, getLabel);
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
