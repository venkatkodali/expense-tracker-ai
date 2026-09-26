import type { Expense } from "@/lib/types";
import { toIsoDate } from "@/lib/utils";
import type { ExportTemplate } from "./types";

/** Applies a template's built-in scope (date lookback / categories) to the full expense list. */
export function selectExpensesForTemplate(expenses: Expense[], template: ExportTemplate): Expense[] {
  let from: string | null = null;

  if (template.id === "tax-report") {
    const jan1 = new Date(new Date().getFullYear(), 0, 1);
    from = toIsoDate(jan1);
  } else if (template.lookbackDays != null) {
    const d = new Date();
    d.setDate(d.getDate() - template.lookbackDays);
    from = toIsoDate(d);
  }

  return expenses
    .filter((e) => {
      if (from && e.date < from) return false;
      if (template.categories !== "all" && !template.categories.includes(e.category)) return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
