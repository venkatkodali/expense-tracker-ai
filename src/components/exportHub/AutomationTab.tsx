"use client";

import { Pause, Play, PlusCircle, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import type { useExportHub } from "@/hooks/useExportHub";
import { EXPORT_TEMPLATES, getTemplate } from "@/lib/exportHub/templates";
import type { DestinationId, ScheduleFrequency } from "@/lib/exportHub/types";
import { DESTINATION_META, formatFutureTime, formatRelativeTime } from "./shared";

const FREQUENCIES: ScheduleFrequency[] = ["daily", "weekly", "monthly"];
const DESTINATIONS: DestinationId[] = ["download", "email", "google-sheets", "dropbox", "onedrive"];

export function AutomationTab({ hub }: { hub: ReturnType<typeof useExportHub> }) {
  const { showToast } = useToast();
  const [templateId, setTemplateId] = useState(EXPORT_TEMPLATES[0].id);
  const [frequency, setFrequency] = useState<ScheduleFrequency>("monthly");
  const [destination, setDestination] = useState<DestinationId>("download");

  const handleCreate = () => {
    hub.createSchedule({ templateId, frequency, destination });
    showToast("Automatic export scheduled.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed border-hairline bg-page px-4 py-3 text-xs text-muted">
        Configuration for what a server-side scheduler would run on your behalf. Since this demo has no
        backend, schedules won&rsquo;t fire while your browser is closed — use &ldquo;Run now&rdquo; to see one
        execute immediately.
      </div>

      <div className="rounded-xl border border-hairline p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary">New scheduled export</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-secondary">Template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-page px-2 py-1.5 text-sm text-primary outline-none focus:ring-2 ring-accent"
            >
              {EXPORT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-secondary">Frequency</span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
              className="w-full rounded-lg border border-hairline bg-page px-2 py-1.5 text-sm text-primary outline-none focus:ring-2 ring-accent"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f[0].toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-secondary">Destination</span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value as DestinationId)}
              className="w-full rounded-lg border border-hairline bg-page px-2 py-1.5 text-sm text-primary outline-none focus:ring-2 ring-accent"
            >
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {DESTINATION_META[d].label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <PlusCircle className="h-4 w-4" />
          Create schedule
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary">Active schedules ({hub.schedules.length})</h3>
        {hub.schedules.length === 0 ? (
          <p className="rounded-lg border border-dashed border-hairline py-8 text-center text-sm text-muted">
            No scheduled exports yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {hub.schedules.map((s) => {
              const t = getTemplate(s.templateId);
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-xl border border-hairline p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {t.name} · {s.frequency} · {DESTINATION_META[s.destination].label}
                    </p>
                    <p className="text-xs text-muted">
                      {s.paused
                        ? "Paused"
                        : `Next run ${formatFutureTime(s.nextRunAt)}`}
                      {s.lastRunAt && ` · Last ran ${formatRelativeTime(s.lastRunAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        hub.runScheduleNow(s.id);
                        showToast(`Ran "${t.name}" now.`);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-hairline px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-page"
                      title="Run now"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Run now
                    </button>
                    <button
                      type="button"
                      onClick={() => hub.toggleSchedulePause(s.id)}
                      className="rounded-lg border border-hairline p-1.5 text-primary hover:bg-page"
                      title={s.paused ? "Resume" : "Pause"}
                    >
                      {s.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => hub.deleteSchedule(s.id)}
                      className="rounded-lg border border-hairline p-1.5 text-[var(--status-critical)] hover:bg-page"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
