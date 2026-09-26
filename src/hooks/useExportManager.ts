"use client";

import { useCallback, useMemo, useState } from "react";
import { CATEGORY_IDS, type CategoryId } from "@/lib/categories";
import { downloadCsv } from "@/lib/export/formats/csv";
import { downloadJson } from "@/lib/export/formats/json";
import { sanitizeFilename } from "@/lib/export/download";
import { selectExpensesForExport } from "@/lib/export/selectExpenses";
import { EXPORT_FORMATS, type ExportFormat, type ExportOptions } from "@/lib/export/types";
import type { Expense } from "@/lib/types";
import { toIsoDate } from "@/lib/utils";

const PREVIEW_LIMIT = 8;
// Export runs are near-instant for realistic dataset sizes; holding the
// loading state for a minimum stretch avoids a jarring flash-of-spinner and
// gives the (synchronous) PDF/CSV generation work a chance to actually run
// off the input event's call stack.
const MIN_VISIBLE_LOADING_MS = 450;

function defaultFilename(): string {
  return `expenses-export-${toIsoDate(new Date())}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ExportRunResult {
  success: boolean;
  count: number;
  error: string | null;
}

export function useExportManager(expenses: Expense[]) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [categories, setCategories] = useState<Set<CategoryId>>(new Set(CATEGORY_IDS));
  const [filename, setFilename] = useState(defaultFilename());
  const [isExporting, setIsExporting] = useState(false);

  const dateRangeError = useMemo(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return "Start date must be before end date.";
    }
    return null;
  }, [dateFrom, dateTo]);

  const options: ExportOptions = useMemo(
    () => ({ format, dateFrom, dateTo, categories, filename }),
    [format, dateFrom, dateTo, categories, filename],
  );

  const selected = useMemo(
    () => (dateRangeError ? [] : selectExpensesForExport(expenses, options)),
    [expenses, options, dateRangeError],
  );

  const previewRows = selected.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, selected.length - PREVIEW_LIMIT);

  const toggleCategory = useCallback((id: CategoryId) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setAllCategories = useCallback((select: boolean) => {
    setCategories(select ? new Set(CATEGORY_IDS) : new Set());
  }, []);

  const runExport = useCallback(async (): Promise<ExportRunResult> => {
    if (dateRangeError) return { success: false, count: 0, error: dateRangeError };
    if (selected.length === 0) {
      return { success: false, count: 0, error: "No expenses match your export filters." };
    }

    setIsExporting(true);
    const extension = EXPORT_FORMATS.find((f) => f.id === format)?.extension ?? "csv";
    const safeName = `${sanitizeFilename(filename, defaultFilename())}.${extension}`;

    try {
      if (format === "pdf") {
        // jsPDF + autotable are sizeable; only pull them into the bundle when
        // someone actually picks PDF, instead of paying that cost up front
        // for every visitor (most of whom will use CSV or JSON).
        const [{ buildAndDownloadPdf }] = await Promise.all([
          import("@/lib/export/formats/pdf"),
          wait(MIN_VISIBLE_LOADING_MS),
        ]);
        buildAndDownloadPdf(selected, safeName);
      } else {
        await wait(MIN_VISIBLE_LOADING_MS);
        if (format === "csv") downloadCsv(selected, safeName);
        else downloadJson(selected, safeName);
      }
      return { success: true, count: selected.length, error: null };
    } catch (err) {
      console.error("Export failed", err);
      return { success: false, count: 0, error: "Something went wrong while generating the file." };
    } finally {
      setIsExporting(false);
    }
  }, [dateRangeError, selected, format, filename]);

  const reset = useCallback(() => {
    setFormat("csv");
    setDateFrom(null);
    setDateTo(null);
    setCategories(new Set(CATEGORY_IDS));
    setFilename(defaultFilename());
  }, []);

  return {
    format,
    setFormat,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    categories,
    toggleCategory,
    setAllCategories,
    filename,
    setFilename,
    dateRangeError,
    selected,
    previewRows,
    hiddenCount,
    isExporting,
    runExport,
    reset,
  };
}
