"use client";

import { Plus, Search } from "lucide-react";
import type { CategoryId, CategoryInfo } from "@/lib/categories";
import type { DatePreset, ExpenseFilters as ExpenseFiltersState } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "this-month", label: "This month" },
  { id: "last-30", label: "Last 30 days" },
  { id: "last-90", label: "Last 90 days" },
  { id: "custom", label: "Custom" },
];

interface ExpenseFiltersProps {
  categories: CategoryInfo[];
  filters: ExpenseFiltersState;
  onChange: (filters: ExpenseFiltersState) => void;
  onManageCategories: () => void;
}

export function ExpenseFiltersBar({ categories, filters, onChange, onManageCategories }: ExpenseFiltersProps) {
  const toggleCategory = (id: CategoryId) => {
    const isSelected = filters.categories.includes(id);
    onChange({
      ...filters,
      categories: isSelected
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id],
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Date range presets */}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange({ ...filters, preset: preset.id })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.preset === preset.id
                  ? "border-accent bg-accent text-white"
                  : "border-hairline text-secondary hover:bg-page",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search description..."
            className="w-full rounded-lg border border-hairline bg-page py-2 pl-9 pr-3 text-sm text-primary outline-none focus:ring-2 ring-accent"
            aria-label="Search expenses by description"
          />
        </div>
      </div>

      {filters.preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-secondary">From</span>
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || null })}
              className="rounded-lg border border-hairline bg-page px-2 py-1.5 text-primary outline-none focus:ring-2 ring-accent"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-secondary">To</span>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value || null })}
              className="rounded-lg border border-hairline bg-page px-2 py-1.5 text-primary outline-none focus:ring-2 ring-accent"
            />
          </label>
        </div>
      )}

      {/* Category filter chips */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-hairline pt-3">
        <span className="mr-1 text-xs font-medium text-muted">Category</span>
        {categories.map((c) => {
          const isSelected = filters.categories.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                isSelected ? "border-accent bg-page" : "border-hairline text-secondary hover:bg-page",
              )}
              aria-pressed={isSelected}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(${c.colorVar})` }}
                aria-hidden="true"
              />
              <span className={isSelected ? "text-primary" : undefined}>{c.label}</span>
            </button>
          );
        })}
        {filters.categories.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, categories: [] })}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onManageCategories}
          className="ml-1 flex items-center gap-1 rounded-full border border-dashed border-hairline px-2.5 py-1 text-xs font-medium text-secondary hover:bg-page"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>
    </div>
  );
}
