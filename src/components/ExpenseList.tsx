"use client";

import { Pencil, Trash2 } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function CategoryBadge({ category }: { category: Expense["category"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-page px-2.5 py-1 text-xs font-medium text-secondary">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: `var(--cat-${category})` }}
        aria-hidden="true"
      />
      {getCategoryLabel(category)}
    </span>
  );
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <>
      {/* Desktop / tablet table */}
      <table className="hidden w-full text-left text-sm sm:table">
        <thead>
          <tr className="border-b border-hairline text-xs uppercase tracking-wide text-muted">
            <th className="py-2 pl-1 font-medium">Date</th>
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 font-medium">Category</th>
            <th className="py-2 pr-1 text-right font-medium">Amount</th>
            <th className="py-2 pr-1 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-hairline last:border-0 hover:bg-page">
              <td className="whitespace-nowrap py-3 pl-1 text-secondary">{formatDate(expense.date)}</td>
              <td className="py-3 pr-4 text-primary">{expense.description}</td>
              <td className="py-3">
                <CategoryBadge category={expense.category} />
              </td>
              <td className="whitespace-nowrap py-3 pr-1 text-right font-semibold tabular-nums text-primary">
                {formatCurrency(expense.amount)}
              </td>
              <td className="py-3 pr-1">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="rounded p-1.5 text-muted hover:bg-surface hover:text-accent"
                    aria-label={`Edit ${expense.description}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(expense)}
                    className="rounded p-1.5 text-muted hover:bg-surface hover:text-[var(--status-critical)]"
                    aria-label={`Delete ${expense.description}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {expenses.map((expense) => (
          <li key={expense.id} className="rounded-lg border border-hairline p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-primary">{expense.description}</p>
                <p className="mt-0.5 text-xs text-muted">{formatDate(expense.date)}</p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-primary">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <CategoryBadge category={expense.category} />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className="rounded p-1.5 text-muted hover:text-accent"
                  aria-label={`Edit ${expense.description}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(expense)}
                  className="rounded p-1.5 text-muted hover:text-[var(--status-critical)]"
                  aria-label={`Delete ${expense.description}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
