import { CATEGORY_IDS, getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function row(cells: Array<string | number>): string {
  return cells.map((c) => escapeCsvCell(String(c))).join(",");
}

/**
 * Builds CSV content. When `groupByCategory` is set, rows are grouped under a
 * heading per category (in the app's fixed category order) with a subtotal,
 * ending in a grand total - the real, distinguishing output of the
 * "Category Analysis" / "Monthly Summary" templates, not just a label.
 */
export function buildCsv(expenses: Expense[], groupByCategory = false): string {
  const header = ["Date", "Category", "Amount", "Description"];

  if (!groupByCategory) {
    const rows = expenses.map((e) => row([e.date, getCategoryLabel(e.category), e.amount.toFixed(2), e.description]));
    return [row(header), ...rows].join("\n");
  }

  const lines: string[] = [row(header)];
  let grandTotal = 0;

  for (const categoryId of CATEGORY_IDS) {
    const group = expenses.filter((e) => e.category === categoryId);
    if (group.length === 0) continue;
    lines.push(row([`# ${getCategoryLabel(categoryId)}`, "", "", ""]));
    let subtotal = 0;
    for (const e of group) {
      lines.push(row([e.date, getCategoryLabel(e.category), e.amount.toFixed(2), e.description]));
      subtotal += e.amount;
    }
    lines.push(row(["", "Subtotal", subtotal.toFixed(2), ""]));
    grandTotal += subtotal;
  }
  lines.push(row(["", "Grand total", grandTotal.toFixed(2), ""]));

  return lines.join("\n");
}
