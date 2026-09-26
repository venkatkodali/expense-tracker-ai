import type { CategoryId } from "@/lib/categories";

export type ExportFormat = "csv" | "json" | "pdf";

export const EXPORT_FORMATS: { id: ExportFormat; label: string; extension: string }[] = [
  { id: "csv", label: "CSV", extension: "csv" },
  { id: "json", label: "JSON", extension: "json" },
  { id: "pdf", label: "PDF", extension: "pdf" },
];

export interface ExportOptions {
  format: ExportFormat;
  /** Inclusive ISO date bounds. null = unbounded on that side. */
  dateFrom: string | null;
  dateTo: string | null;
  /** Empty set means "no categories selected" (not "all"), unlike the dashboard filters. */
  categories: Set<CategoryId>;
  /** Filename without extension; the extension is appended from `format`. */
  filename: string;
}
