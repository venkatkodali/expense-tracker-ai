import type { Expense } from "@/lib/types";
import { toIsoDate } from "@/lib/utils";
import { buildCsv } from "./formats/csv";
import { buildJson } from "./formats/json";
import { downloadTextFile } from "./download";
import { selectExpensesForTemplate } from "./select";
import type { ExportTemplate } from "./types";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Generates and downloads the real file for a template. Every destination in
 * the export hub (email, Google Sheets, Dropbox, OneDrive) is simulated at
 * the UI layer, but the artifact itself is always this real, correctly
 * filtered file - never a no-op.
 */
export async function runTemplateExport(
  expenses: Expense[],
  template: ExportTemplate,
): Promise<{ recordCount: number }> {
  const selected = selectExpensesForTemplate(expenses, template);
  const filename = `${slugify(template.name)}-${toIsoDate(new Date())}.${template.format}`;

  if (template.format === "csv") {
    downloadTextFile(buildCsv(selected, template.groupByCategory), "text/csv;charset=utf-8;", filename);
  } else if (template.format === "json") {
    downloadTextFile(buildJson(selected), "application/json;charset=utf-8;", filename);
  } else {
    // jsPDF + autotable are sizeable; only load them when a PDF template is
    // actually run, instead of shipping that weight to every visitor.
    const { downloadPdf } = await import("./formats/pdf");
    downloadPdf(selected, template.name, filename, template.groupByCategory);
  }

  return { recordCount: selected.length };
}
