"use client";

import { CalendarClock, Cloud, History as HistoryIcon, LayoutTemplate, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useExportHub } from "@/hooks/useExportHub";
import type { Expense } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AutomationTab } from "./AutomationTab";
import { ConnectionsTab } from "./ConnectionsTab";
import { HistoryTab } from "./HistoryTab";
import { ShareTab } from "./ShareTab";
import { TemplatesTab } from "./TemplatesTab";

type TabId = "templates" | "connections" | "automation" | "history" | "share";

const TABS: { id: TabId; label: string; icon: typeof Cloud }[] = [
  { id: "templates", label: "Quick export", icon: LayoutTemplate },
  { id: "connections", label: "Connections", icon: Cloud },
  { id: "automation", label: "Automation", icon: CalendarClock },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "share", label: "Share", icon: Share2 },
];

interface ExportHubModalProps {
  expenses: Expense[];
  onClose: () => void;
}

export function ExportHubModal({ expenses, onClose }: ExportHubModalProps) {
  const hub = useExportHub(expenses);
  const [tab, setTab] = useState<TabId>("templates");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Export hub"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-modal-in flex h-full max-h-[720px] w-full max-w-4xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl">
        {/* Sidebar */}
        <div className="hidden w-52 shrink-0 flex-col border-r border-hairline bg-page p-4 sm:flex">
          <div className="mb-4 px-1">
            <p className="text-sm font-semibold text-primary">Export Hub</p>
            <p className="text-xs text-muted">Connect, schedule &amp; share</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    active ? "bg-accent text-white" : "text-secondary hover:bg-surface hover:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-primary sm:hidden">Export Hub</h2>
              <h2 className="hidden text-base font-semibold text-primary sm:block">
                {TABS.find((t) => t.id === tab)?.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted hover:text-primary"
              aria-label="Close export hub"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile tab bar */}
          <div className="flex gap-1 overflow-x-auto border-b border-hairline px-3 py-2 sm:hidden">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    active ? "bg-accent text-white" : "bg-page text-secondary",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === "templates" && <TemplatesTab hub={hub} />}
            {tab === "connections" && <ConnectionsTab hub={hub} />}
            {tab === "automation" && <AutomationTab hub={hub} />}
            {tab === "history" && <HistoryTab hub={hub} />}
            {tab === "share" && <ShareTab hub={hub} />}
          </div>
        </div>
      </div>
    </div>
  );
}
