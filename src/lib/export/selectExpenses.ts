import type { Expense } from "@/lib/types";
import type { ExportOptions } from "./types";

/**
 * Applies the export dialog's own date-range + category selection to the
 * full expense list. Deliberately separate from the dashboard's
 * `filterExpenses` (which uses presets + free-text search): this is a
 * simpler, explicit start/end + checkbox selection meant for a one-off
 * export, not the live dashboard view.
 */
export function selectExpensesForExport(expenses: Expense[], options: ExportOptions): Expense[] {
  return expenses
    .filter((e) => {
      if (options.dateFrom && e.date < options.dateFrom) return false;
      if (options.dateTo && e.date > options.dateTo) return false;
      if (!options.categories.has(e.category)) return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
