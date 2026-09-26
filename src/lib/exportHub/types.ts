import type { CategoryId } from "@/lib/categories";

export type ExportFileFormat = "csv" | "json" | "pdf";

export type DestinationId = "download" | "email" | "google-sheets" | "dropbox" | "onedrive";

export type ConnectionServiceId = "google-sheets" | "dropbox" | "onedrive";

export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFileFormat;
  /** How far back to include, in days. null = all time. */
  lookbackDays: number | null;
  categories: CategoryId[] | "all";
  /** Sorts/groups rows by category with subtotals instead of a flat list. */
  groupByCategory?: boolean;
}

export interface ConnectionState {
  service: ConnectionServiceId;
  status: "disconnected" | "connecting" | "connected";
  accountLabel: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
}

export interface ScheduledExport {
  id: string;
  templateId: string;
  frequency: ScheduleFrequency;
  destination: DestinationId;
  createdAt: string;
  nextRunAt: string;
  paused: boolean;
  lastRunAt: string | null;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  templateName: string;
  format: ExportFileFormat;
  destination: DestinationId;
  recordCount: number;
  source: "manual" | "scheduled";
}

export interface ShareLink {
  id: string;
  createdAt: string;
  templateName: string;
  recordCount: number;
  url: string;
  qrDataUrl: string;
}
