import { getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { downloadTextFile } from "../download";

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(expenses: Expense[]): string {
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

export function downloadCsv(expenses: Expense[], filename: string): void {
  downloadTextFile(buildCsv(expenses), "text/csv;charset=utf-8;", filename);
}
