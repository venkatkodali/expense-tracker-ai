"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { EXPORT_TEMPLATES } from "@/lib/exportHub/templates";
import type { DestinationId } from "@/lib/exportHub/types";
import type { useExportHub } from "@/hooks/useExportHub";
import { cn } from "@/lib/utils";
import { DESTINATION_META } from "./shared";

const DESTINATIONS: DestinationId[] = ["download", "email", "google-sheets", "dropbox", "onedrive"];

export function TemplatesTab({ hub }: { hub: ReturnType<typeof useExportHub> }) {
  const { showToast } = useToast();
  const [justSent, setJustSent] = useState(false);

  const handleExport = async () => {
    setJustSent(false);
    const result = await hub.runQuickExport();
    if (!result.success) {
      showToast(result.error ?? "Export failed.", "error");
      return;
    }
    setJustSent(true);
    showToast(`Sent "${EXPORT_TEMPLATES.find((t) => t.id === hub.templateId)?.name}" via ${DESTINATION_META[hub.destination].label.toLowerCase()}.`);
    setTimeout(() => setJustSent(false), 2000);
  };

  const needsConnection = hub.destination !== "download" && hub.destination !== "email";
  const connectionOk =
    !needsConnection ||
    hub.connections.find((c) => c.service === hub.destination)?.status === "connected";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">Choose a template</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXPORT_TEMPLATES.map((t) => {
            const selected = hub.templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => hub.setTemplateId(t.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  selected ? "border-accent bg-page" : "border-hairline hover:bg-page",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{t.name}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                    {t.format}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">Send to</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DESTINATIONS.map((d) => {
            const meta = DESTINATION_META[d];
            const Icon = meta.icon;
            const selected = hub.destination === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => hub.setDestination(d)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors",
                  selected ? "border-accent bg-page" : "border-hairline hover:bg-page",
                )}
              >
                <Icon className={cn("h-5 w-5", selected ? "text-accent" : "text-muted")} />
                <span className="text-[11px] font-medium leading-tight text-primary">{meta.label}</span>
              </button>
            );
          })}
        </div>

        {hub.destination === "email" && (
          <input
            type="email"
            value={hub.emailAddress}
            onChange={(e) => hub.setEmailAddress(e.target.value)}
            placeholder="you@example.com"
            className="mt-3 w-full rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-primary outline-none focus:ring-2 ring-accent"
          />
        )}

        {needsConnection && !connectionOk && (
          <p className="mt-2 text-xs text-[var(--status-critical)]">
            {DESTINATION_META[hub.destination].label} isn&rsquo;t connected yet — head to the Connections tab.
          </p>
        )}

        {(hub.destination === "email" || needsConnection) && (
          <p className="mt-2 text-xs text-muted">
            Demo only — no real message is sent. We&rsquo;ll generate the real file and download it for you to
            attach or upload.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-hairline bg-page px-4 py-3">
        <div>
          <p className="text-sm font-medium text-primary">{hub.previewCount} record{hub.previewCount === 1 ? "" : "s"}</p>
          <p className="text-xs text-muted">match this template&rsquo;s scope</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={hub.isExporting || hub.previewCount === 0 || !connectionOk}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hub.isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Exporting...
            </>
          ) : justSent ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Sent
            </>
          ) : (
            "Export now"
          )}
        </button>
      </div>
    </div>
  );
}
