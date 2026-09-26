import { Cloud, HardDrive, Mail, Table2 } from "lucide-react";
import type { ConnectionServiceId, DestinationId } from "@/lib/exportHub/types";

export const SERVICE_META: Record<ConnectionServiceId, { label: string; icon: typeof Cloud; accent: string }> = {
  "google-sheets": { label: "Google Sheets", icon: Table2, accent: "#1baf7a" },
  dropbox: { label: "Dropbox", icon: Cloud, accent: "#2a78d6" },
  onedrive: { label: "OneDrive", icon: HardDrive, accent: "#2a78d6" },
};

export const DESTINATION_META: Record<DestinationId, { label: string; icon: typeof Cloud }> = {
  download: { label: "Download to device", icon: HardDrive },
  email: { label: "Email report", icon: Mail },
  "google-sheets": { label: "Send to Google Sheets", icon: Table2 },
  dropbox: { label: "Send to Dropbox", icon: Cloud },
  onedrive: { label: "Send to OneDrive", icon: HardDrive },
};

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay}d ago`;
}

export function formatFutureTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "Due now";
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `in ${diffHour}h`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `in ${diffDay}d`;
  const diffMonth = Math.round(diffDay / 30);
  return `in ${diffMonth}mo`;
}
