"use client";

import {
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { EXPORT_FORMATS, type ExportFormat } from "@/lib/export/types";
import { useExportManager } from "@/hooks/useExportManager";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface ExportDrawerProps {
  expenses: Expense[];
  onClose: () => void;
  onExported: (count: number, format: ExportFormat) => void;
}

const FORMAT_ICONS: Record<ExportFormat, typeof FileSpreadsheet> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  csv: "Opens in Excel, Sheets, or Numbers",
  json: "Structured data for scripts & APIs",
  pdf: "Formatted report, ready to print",
};

export function ExportDrawer({ expenses, onClose, onExported }: ExportDrawerProps) {
  const manager = useExportManager(expenses);
  const [isVisible, setIsVisible] = useState(false);
  const [justExported, setJustExported] = useState<{ count: number; format: ExportFormat } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Mount with the panel off-screen, then slide it in on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleExport = async () => {
    setError(null);
    const result = await manager.runExport();
    if (!result.success) {
      setError(result.error);
      return;
    }
    setJustExported({ count: result.count, format: manager.format });
    onExported(result.count, manager.format);
    setTimeout(onClose, 1100);
  };

  const allSelected = manager.categories.size === CATEGORIES.length;
  const noneSelected = manager.categories.size === 0;
  const canExport = manager.selected.length > 0 && !manager.dateRangeError && !manager.isExporting;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Export data">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-hairline bg-surface shadow-2xl transition-transform duration-200 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-primary">Export data</h2>
            <p className="mt-0.5 text-xs text-muted">
              Choose a format, filter what&rsquo;s included, and download.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-primary"
            aria-label="Close export panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Format */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Format</h3>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_FORMATS.map((f) => {
                const Icon = FORMAT_ICONS[f.id];
                const selected = manager.format === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => manager.setFormat(f.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors",
                      selected ? "border-accent bg-page" : "border-hairline hover:bg-page",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", selected ? "text-accent" : "text-muted")} />
                    <span className="text-xs font-semibold text-primary">{f.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">{FORMAT_DESCRIPTIONS[manager.format]}</p>
          </section>

          {/* Date range */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Date range
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs text-secondary">From</span>
                <input
                  type="date"
                  value={manager.dateFrom ?? ""}
                  onChange={(e) => manager.setDateFrom(e.target.value || null)}
                  className="w-full rounded-lg border border-hairline bg-page px-2 py-1.5 text-sm text-primary outline-none focus:ring-2 ring-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-secondary">To</span>
                <input
                  type="date"
                  value={manager.dateTo ?? ""}
                  onChange={(e) => manager.setDateTo(e.target.value || null)}
                  className="w-full rounded-lg border border-hairline bg-page px-2 py-1.5 text-sm text-primary outline-none focus:ring-2 ring-accent"
                />
              </label>
            </div>
            {manager.dateRangeError && (
              <p className="mt-1.5 text-xs text-[var(--status-critical)]">{manager.dateRangeError}</p>
            )}
          </section>

          {/* Categories */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Categories</h3>
              <button
                type="button"
                onClick={() => manager.setAllCategories(!allSelected)}
                className="text-xs font-medium text-accent hover:underline"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => {
                const checked = manager.categories.has(c.id);
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                      checked ? "border-accent bg-page" : "border-hairline hover:bg-page",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => manager.toggleCategory(c.id)}
                      className="sr-only"
                    />
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--cat-${c.id})` }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-primary">{c.label}</span>
                  </label>
                );
              })}
            </div>
            {noneSelected && (
              <p className="mt-1.5 text-xs text-muted">Select at least one category to export.</p>
            )}
          </section>

          {/* Filename */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Filename</h3>
            <div className="flex items-center rounded-lg border border-hairline bg-page pr-3 focus-within:ring-2 ring-accent">
              <input
                type="text"
                value={manager.filename}
                onChange={(e) => manager.setFilename(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-primary outline-none"
                aria-label="Export filename"
              />
              <span className="shrink-0 text-xs text-muted">
                .{EXPORT_FORMATS.find((f) => f.id === manager.format)?.extension}
              </span>
            </div>
          </section>

          {/* Summary + preview */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</h3>
              <span className="rounded-full bg-page px-2.5 py-1 text-xs font-semibold text-secondary">
                {manager.selected.length} of {expenses.length} record
                {expenses.length === 1 ? "" : "s"}
              </span>
            </div>

            {manager.selected.length === 0 ? (
              <div className="rounded-lg border border-dashed border-hairline py-8 text-center text-sm text-muted">
                No expenses match these filters.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-hairline">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-hairline bg-page text-muted">
                      <th className="px-2.5 py-1.5 font-medium">Date</th>
                      <th className="px-2.5 py-1.5 font-medium">Category</th>
                      <th className="px-2.5 py-1.5 text-right font-medium">Amount</th>
                      <th className="px-2.5 py-1.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manager.previewRows.map((e) => (
                      <tr key={e.id} className="border-b border-hairline last:border-0">
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-secondary">
                          {formatDate(e.date)}
                        </td>
                        <td className="px-2.5 py-1.5 text-secondary">
                          {CATEGORIES.find((c) => c.id === e.category)?.label}
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-right font-medium tabular-nums text-primary">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="max-w-[120px] truncate px-2.5 py-1.5 text-primary" title={e.description}>
                          {e.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {manager.hiddenCount > 0 && (
                  <p className="border-t border-hairline bg-page px-2.5 py-1.5 text-center text-xs text-muted">
                    + {manager.hiddenCount} more row{manager.hiddenCount === 1 ? "" : "s"} not shown
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-hairline px-5 py-4">
          {error && <p className="mb-2 text-xs text-[var(--status-critical)]">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-primary hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {justExported ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Exported {justExported.count} record{justExported.count === 1 ? "" : "s"}
                </>
              ) : manager.isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                `Export ${manager.selected.length} record${manager.selected.length === 1 ? "" : "s"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
