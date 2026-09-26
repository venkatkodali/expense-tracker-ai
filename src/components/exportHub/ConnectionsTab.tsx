"use client";

import { Loader2 } from "lucide-react";
import type { useExportHub } from "@/hooks/useExportHub";
import type { ConnectionServiceId } from "@/lib/exportHub/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime, SERVICE_META } from "./shared";

const SERVICES: ConnectionServiceId[] = ["google-sheets", "dropbox", "onedrive"];

export function ConnectionsTab({ hub }: { hub: ReturnType<typeof useExportHub> }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-hairline bg-page px-4 py-3 text-xs text-muted">
        Demo integrations — connecting here doesn&rsquo;t contact a real service. It unlocks the matching
        destination in Quick Export and Automation, and records a real file download each time you use it.
      </div>

      {SERVICES.map((service) => {
        const meta = SERVICE_META[service];
        const Icon = meta.icon;
        const connection = hub.connections.find((c) => c.service === service);
        const status = connection?.status ?? "disconnected";

        return (
          <div
            key={service}
            className="flex flex-col gap-3 rounded-xl border border-hairline p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${meta.accent}1a` }}
              >
                <Icon className="h-5 w-5" style={{ color: meta.accent }} />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">{meta.label}</p>
                {status === "connected" ? (
                  <p className="text-xs text-muted">
                    {connection?.accountLabel} · Synced {formatRelativeTime(connection?.lastSyncAt ?? null)}
                  </p>
                ) : status === "connecting" ? (
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
                  </p>
                ) : (
                  <p className="text-xs text-muted">Not connected</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status === "connected" && (
                <span className="flex items-center gap-1 rounded-full bg-page px-2.5 py-1 text-xs font-medium text-[var(--status-good)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-good)]" />
                  Connected
                </span>
              )}
              <button
                type="button"
                onClick={() => (status === "connected" ? hub.disconnect(service) : hub.connect(service))}
                disabled={status === "connecting"}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-60",
                  status === "connected"
                    ? "border-hairline text-primary hover:bg-page"
                    : "border-accent bg-accent text-white hover:bg-accent-hover",
                )}
              >
                {status === "connected" ? "Disconnect" : status === "connecting" ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
