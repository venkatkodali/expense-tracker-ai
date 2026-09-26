import type { Expense, ExpenseFilters } from "./types";
import { toIsoDate } from "./utils";

export const DEFAULT_FILTERS: ExpenseFilters = {
  search: "",
  categories: [],
  preset: "all",
  dateFrom: null,
  dateTo: null,
};

function presetRange(filters: ExpenseFilters): { from: string | null; to: string | null } {
  const today = new Date();
  const todayIso = toIsoDate(today);

  switch (filters.preset) {
    case "all":
      return { from: null, to: null };
    case "this-month": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toIsoDate(first), to: todayIso };
    }
    case "last-30": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from: toIsoDate(from), to: todayIso };
    }
    case "last-90": {
      const from = new Date(today);
      from.setDate(from.getDate() - 90);
      return { from: toIsoDate(from), to: todayIso };
    }
    case "custom":
      return { from: filters.dateFrom, to: filters.dateTo };
  }
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const { from, to } = presetRange(filters);
  const search = filters.search.trim().toLowerCase();

  return expenses.filter((e) => {
    if (from && e.date < from) return false;
    if (to && e.date > to) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false;
    if (search && !e.description.toLowerCase().includes(search)) return false;
    return true;
  });
}
