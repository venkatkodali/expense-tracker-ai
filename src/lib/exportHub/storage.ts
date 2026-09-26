import { z } from "zod";
import type { ConnectionState, HistoryEntry, ScheduledExport } from "./types";

const KEYS = {
  connections: "expense-tracker:v3:connections",
  schedules: "expense-tracker:v3:schedules",
  history: "expense-tracker:v3:history",
} as const;

function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
}

const connectionSchema = z.object({
  service: z.enum(["google-sheets", "dropbox", "onedrive"]),
  status: z.enum(["disconnected", "connecting", "connected"]),
  accountLabel: z.string().nullable(),
  connectedAt: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
});
const connectionsSchema = z.array(connectionSchema);

const scheduleSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  destination: z.enum(["download", "email", "google-sheets", "dropbox", "onedrive"]),
  createdAt: z.string(),
  nextRunAt: z.string(),
  paused: z.boolean(),
  lastRunAt: z.string().nullable(),
});
const schedulesSchema = z.array(scheduleSchema);

const historyEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  templateName: z.string(),
  format: z.enum(["csv", "json", "pdf"]),
  destination: z.enum(["download", "email", "google-sheets", "dropbox", "onedrive"]),
  recordCount: z.number(),
  source: z.enum(["manual", "scheduled"]),
});
const historySchema = z.array(historyEntrySchema);

export function loadConnections(): ConnectionState[] {
  return readJson(KEYS.connections, connectionsSchema, []);
}
export function saveConnections(connections: ConnectionState[]): void {
  writeJson(KEYS.connections, connections);
}

export function loadSchedules(): ScheduledExport[] {
  return readJson(KEYS.schedules, schedulesSchema, []);
}
export function saveSchedules(schedules: ScheduledExport[]): void {
  writeJson(KEYS.schedules, schedules);
}

const MAX_HISTORY_ENTRIES = 100;

export function loadHistory(): HistoryEntry[] {
  return readJson(KEYS.history, historySchema, []);
}
export function saveHistory(history: HistoryEntry[]): void {
  writeJson(KEYS.history, history.slice(0, MAX_HISTORY_ENTRIES));
}
