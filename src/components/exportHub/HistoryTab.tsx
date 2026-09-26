"use client";

import { Clock, Zap } from "lucide-react";
import type { useExportHub } from "@/hooks/useExportHub";
import { DESTINATION_META } from "./shared";

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function HistoryTab({ hub }: { hub: ReturnType<typeof useExportHub> }) {
  if (hub.history.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-hairline py-10 text-center text-sm text-muted">
        No exports yet — anything you send from Quick Export or Automation shows up here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="mb-1 text-sm font-semibold text-primary">Export history ({hub.history.length})</h3>
      <ul className="divide-y divide-[var(--border-hairline)] overflow-hidden rounded-xl border border-hairline">
        {hub.history.map((entry) => {
          const meta = DESTINATION_META[entry.destination];
          const Icon = meta.icon;
          return (
            <li key={entry.id} className="flex items-center justify-between gap-3 bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-muted" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {entry.templateName}{" "}
                    <span className="font-normal text-muted">
                      · {entry.recordCount} record{entry.recordCount === 1 ? "" : "s"} · {entry.format.toUpperCase()}
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(entry.timestamp)} · {meta.label}
                    {entry.source === "scheduled" && (
                      <span className="ml-1 flex items-center gap-0.5 text-accent">
                        <Zap className="h-3 w-3" /> Automated
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
