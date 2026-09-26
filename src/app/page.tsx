"use client";

import { Download, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseFiltersBar } from "@/components/ExpenseFilters";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Header } from "@/components/Header";
import { ManageCategoriesModal } from "@/components/ManageCategoriesModal";
import { Modal } from "@/components/Modal";
import { ChartSkeleton, ListSkeleton, SummarySkeleton } from "@/components/Skeletons";
import { SummaryCards } from "@/components/SummaryCards";
import { TrendChart } from "@/components/TrendChart";
import { useToast } from "@/components/ToastProvider";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import type { CategoryInfo } from "@/lib/categories";
import { downloadExpensesCsv } from "@/lib/csv";
import { DEFAULT_FILTERS, filterExpenses } from "@/lib/filterExpenses";
import { categoryTotals, computeSummary, monthlyTotals } from "@/lib/stats";
import type { Expense, ExpenseFilters, ExpenseInput } from "@/lib/types";

type ModalState = { mode: "add" } | { mode: "edit"; expense: Expense } | null;

const FALLBACK_CATEGORY_ID = "other";

export default function DashboardPage() {
  const { expenses, isLoading, loadError, saveError, addExpense, updateExpense, deleteExpense, reassignCategory } =
    useExpenses();
  const categories = useCategories();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [modal, setModal] = useState<ModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<CategoryInfo | null>(null);

  const filtered = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);
  const summary = useMemo(() => computeSummary(filtered, categories.categories), [filtered, categories.categories]);
  const categoryData = useMemo(
    () => categoryTotals(filtered, categories.categories),
    [filtered, categories.categories],
  );
  const trendData = useMemo(() => monthlyTotals(filtered, 6), [filtered]);

  const hasAnyExpenses = expenses.length > 0;
  const hasFilteredResults = filtered.length > 0;

  const handleAdd = (input: ExpenseInput) => {
    addExpense(input);
    setModal(null);
    showToast("Expense added.");
  };

  const handleEdit = (input: ExpenseInput) => {
    if (modal?.mode !== "edit") return;
    updateExpense(modal.expense.id, input);
    setModal(null);
    showToast("Expense updated.");
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteExpense(pendingDelete.id);
    setPendingDelete(null);
    showToast("Expense deleted.");
  };

  const handleConfirmCategoryDelete = () => {
    if (!pendingCategoryDelete) return;
    const affectedCount = expenses.filter((e) => e.category === pendingCategoryDelete.id).length;
    reassignCategory(pendingCategoryDelete.id, FALLBACK_CATEGORY_ID);
    categories.deleteCategory(pendingCategoryDelete.id);
    setPendingCategoryDelete(null);
    showToast(
      affectedCount > 0
        ? `Deleted "${pendingCategoryDelete.label}" — ${affectedCount} expense${affectedCount === 1 ? "" : "s"} moved to Other.`
        : `Deleted "${pendingCategoryDelete.label}".`,
    );
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast("Nothing to export for the current filters.", "error");
      return;
    }
    downloadExpensesCsv(filtered, categories.getLabel, `expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exported ${filtered.length} expense${filtered.length === 1 ? "" : "s"} to CSV.`);
  };

  return (
    <div className="min-h-screen bg-page">
      <Header />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {loadError && (
          <div className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-[var(--status-critical)]">
            {loadError}
          </div>
        )}
        {saveError && (
          <div className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-[var(--status-critical)]">
            {saveError}
          </div>
        )}

        {/* Summary */}
        {isLoading ? <SummarySkeleton /> : <SummaryCards summary={summary} />}

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary">Spending by category</h2>
            {isLoading ? <ChartSkeleton /> : <CategoryBarChart data={categoryData} />}
          </div>
          <div className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary">Monthly trend</h2>
            {isLoading ? <ChartSkeleton /> : <TrendChart data={trendData} />}
          </div>
        </div>

        {/* Filters */}
        <ExpenseFiltersBar
          categories={categories.categories}
          filters={filters}
          onChange={setFilters}
          onManageCategories={() => setIsManageCategoriesOpen(true)}
        />

        {/* List */}
        <div className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary">
              Expenses <span className="text-muted">({filtered.length})</span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-primary hover:bg-page"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setModal({ mode: "add" })}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                <PlusCircle className="h-4 w-4" />
                Add expense
              </button>
            </div>
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : !hasAnyExpenses ? (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to start tracking your spending."
              actionLabel="Add expense"
              onAction={() => setModal({ mode: "add" })}
            />
          ) : !hasFilteredResults ? (
            <EmptyState
              title="No matching expenses"
              description="Try adjusting your search, category, or date filters."
            />
          ) : (
            <ExpenseList
              expenses={filtered}
              categories={categories.categories}
              onEdit={(expense) => setModal({ mode: "edit", expense })}
              onDelete={(expense) => setPendingDelete(expense)}
            />
          )}
        </div>
      </main>

      {modal && (
        <Modal
          title={modal.mode === "add" ? "Add expense" : "Edit expense"}
          onClose={() => setModal(null)}
        >
          <ExpenseForm
            categories={categories.categories}
            initialValues={modal.mode === "edit" ? modal.expense : undefined}
            submitLabel={modal.mode === "add" ? "Add expense" : "Save changes"}
            onSubmit={modal.mode === "add" ? handleAdd : handleEdit}
            onCancel={() => setModal(null)}
            onManageCategories={() => setIsManageCategoriesOpen(true)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete expense?"
          description={`This will permanently delete "${pendingDelete.description}" (${pendingDelete.date}). This can't be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {isManageCategoriesOpen && (
        <ManageCategoriesModal
          categories={categories.categories}
          addCategory={categories.addCategory}
          renameCategory={categories.renameCategory}
          onClose={() => setIsManageCategoriesOpen(false)}
          onRequestDelete={(category) => setPendingCategoryDelete(category)}
        />
      )}

      {pendingCategoryDelete && (
        <ConfirmDialog
          title="Delete category?"
          description={`Any expenses in "${pendingCategoryDelete.label}" will be moved to "Other". This can't be undone.`}
          onConfirm={handleConfirmCategoryDelete}
          onCancel={() => setPendingCategoryDelete(null)}
        />
      )}
    </div>
  );
}
