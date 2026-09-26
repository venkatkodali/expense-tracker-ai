"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateQrDataUrl } from "@/lib/exportHub/qrcode";
import { runTemplateExport } from "@/lib/exportHub/runExport";
import { computeNextRun } from "@/lib/exportHub/schedule";
import { selectExpensesForTemplate } from "@/lib/exportHub/select";
import {
  loadConnections,
  loadHistory,
  loadSchedules,
  saveConnections,
  saveHistory,
  saveSchedules,
} from "@/lib/exportHub/storage";
import { EXPORT_TEMPLATES, getTemplate } from "@/lib/exportHub/templates";
import type {
  ConnectionServiceId,
  ConnectionState,
  DestinationId,
  HistoryEntry,
  ScheduleFrequency,
  ScheduledExport,
  ShareLink,
} from "@/lib/exportHub/types";
import type { Expense } from "@/lib/types";
import { generateId } from "@/lib/utils";

const SERVICES: ConnectionServiceId[] = ["google-sheets", "dropbox", "onedrive"];
const CONNECT_SIMULATION_MS = 1100;
const EXPORT_SIMULATION_MS = 700;

function defaultConnection(service: ConnectionServiceId): ConnectionState {
  return { service, status: "disconnected", accountLabel: null, connectedAt: null, lastSyncAt: null };
}

function ensureAllServices(loaded: ConnectionState[]): ConnectionState[] {
  return SERVICES.map((service) => loaded.find((c) => c.service === service) ?? defaultConnection(service));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useExportHub(expenses: Expense[]) {
  const [connections, setConnections] = useState<ConnectionState[]>(() => ensureAllServices([]));
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [templateId, setTemplateId] = useState(EXPORT_TEMPLATES[0].id);
  const [destination, setDestination] = useState<DestinationId>("download");
  const [emailAddress, setEmailAddress] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Load persisted hub state once on mount.
  useEffect(() => {
    setConnections(ensureAllServices(loadConnections()));
    setSchedules(loadSchedules());
    setHistory(loadHistory());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveConnections(connections);
  }, [connections, isReady]);
  useEffect(() => {
    if (!isReady) return;
    saveSchedules(schedules);
  }, [schedules, isReady]);
  useEffect(() => {
    if (!isReady) return;
    saveHistory(history);
  }, [history, isReady]);

  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const previewCount = useMemo(() => selectExpensesForTemplate(expenses, template).length, [expenses, template]);

  const connectionFor = useCallback(
    (service: ConnectionServiceId) => connections.find((c) => c.service === service),
    [connections],
  );

  const connect = useCallback((service: ConnectionServiceId) => {
    setConnections((prev) =>
      prev.map((c) => (c.service === service ? { ...c, status: "connecting" } : c)),
    );
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) =>
          c.service === service
            ? {
                ...c,
                status: "connected",
                accountLabel: "Demo Account",
                connectedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    }, CONNECT_SIMULATION_MS);
  }, []);

  const disconnect = useCallback((service: ConnectionServiceId) => {
    setConnections((prev) => prev.map((c) => (c.service === service ? defaultConnection(service) : c)));
  }, []);

  const markSynced = useCallback((dest: DestinationId) => {
    if (dest === "download" || dest === "email") return;
    setConnections((prev) =>
      prev.map((c) => (c.service === dest ? { ...c, lastSyncAt: new Date().toISOString() } : c)),
    );
  }, []);

  const logHistory = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    setHistory((prev) => [{ id: generateId(), timestamp: new Date().toISOString(), ...entry }, ...prev]);
  }, []);

  /** Runs the currently selected template + destination combo (the "Quick Export" action). */
  const runQuickExport = useCallback(async (): Promise<{ success: boolean; error: string | null }> => {
    if (destination === "email" && !emailPattern.test(emailAddress)) {
      return { success: false, error: "Enter a valid email address." };
    }
    if (
      (destination === "google-sheets" || destination === "dropbox" || destination === "onedrive") &&
      connectionFor(destination)?.status !== "connected"
    ) {
      return { success: false, error: "Connect this service first, from the Connections tab." };
    }

    setIsExporting(true);
    await wait(EXPORT_SIMULATION_MS);
    try {
      const { recordCount } = await runTemplateExport(expenses, template);
      logHistory({
        templateName: template.name,
        format: template.format,
        destination,
        recordCount,
        source: "manual",
      });
      markSynced(destination);
      return { success: true, error: null };
    } finally {
      setIsExporting(false);
    }
  }, [destination, emailAddress, connectionFor, expenses, template, logHistory, markSynced]);

  const createSchedule = useCallback(
    (input: { templateId: string; frequency: ScheduleFrequency; destination: DestinationId }) => {
      const schedule: ScheduledExport = {
        id: generateId(),
        templateId: input.templateId,
        frequency: input.frequency,
        destination: input.destination,
        createdAt: new Date().toISOString(),
        nextRunAt: computeNextRun(input.frequency),
        paused: false,
        lastRunAt: null,
      };
      setSchedules((prev) => [schedule, ...prev]);
    },
    [],
  );

  const toggleSchedulePause = useCallback((id: string) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, paused: !s.paused } : s)));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const runScheduleNow = useCallback(
    async (id: string) => {
      const schedule = schedules.find((s) => s.id === id);
      if (!schedule) return;
      const scheduleTemplate = getTemplate(schedule.templateId);
      const { recordCount } = await runTemplateExport(expenses, scheduleTemplate);
      const now = new Date().toISOString();
      logHistory({
        templateName: scheduleTemplate.name,
        format: scheduleTemplate.format,
        destination: schedule.destination,
        recordCount,
        source: "scheduled",
      });
      markSynced(schedule.destination);
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, lastRunAt: now, nextRunAt: computeNextRun(s.frequency, new Date(now)) } : s,
        ),
      );
    },
    [schedules, expenses, logHistory, markSynced],
  );

  const generateShareLink = useCallback(async () => {
    const count = selectExpensesForTemplate(expenses, template).length;
    const url = `https://expensetracker.app/share/${generateId().slice(0, 10)}`;
    const qrDataUrl = await generateQrDataUrl(url);
    const link: ShareLink = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      templateName: template.name,
      recordCount: count,
      url,
      qrDataUrl,
    };
    setShareLinks((prev) => [link, ...prev].slice(0, 5));
    return link;
  }, [expenses, template]);

  return {
    // Quick export
    templateId,
    setTemplateId,
    destination,
    setDestination,
    emailAddress,
    setEmailAddress,
    isExporting,
    previewCount,
    runQuickExport,

    // Connections
    connections,
    connect,
    disconnect,

    // Automation
    schedules,
    createSchedule,
    toggleSchedulePause,
    deleteSchedule,
    runScheduleNow,

    // History
    history,

    // Share
    shareLinks,
    generateShareLink,
  };
}
