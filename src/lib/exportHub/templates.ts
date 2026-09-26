import type { ExportTemplate } from "./types";

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Every expense since Jan 1, formatted as a formal PDF report.",
    format: "pdf",
    lookbackDays: null, // overridden to "since Jan 1" at selection time
    categories: "all",
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "This month's spending, grouped by category.",
    format: "pdf",
    lookbackDays: 30,
    categories: "all",
    groupByCategory: true,
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "All-time spending sorted by category with subtotals, as CSV.",
    format: "csv",
    lookbackDays: null,
    categories: "all",
    groupByCategory: true,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Everything, unfiltered — pick your own format.",
    format: "csv",
    lookbackDays: null,
    categories: "all",
  },
];

export function getTemplate(id: string): ExportTemplate {
  return EXPORT_TEMPLATES.find((t) => t.id === id) ?? EXPORT_TEMPLATES[EXPORT_TEMPLATES.length - 1];
}
