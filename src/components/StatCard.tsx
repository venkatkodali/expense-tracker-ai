import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Signed percentage change vs a named prior period. */
  delta?: { percent: number; goodDirection: "up" | "down"; periodLabel: string } | null;
  subtitle?: string;
}

export function StatCard({ label, value, icon: Icon, delta, subtitle }: StatCardProps) {
  const isUp = delta ? delta.percent > 0 : false;
  const isFlat = delta ? Math.round(delta.percent) === 0 : true;
  const isGood = delta ? (isUp ? delta.goodDirection === "up" : delta.goodDirection === "down") : false;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary">{label}</span>
        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">{value}</p>
      {delta && !isFlat && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            isGood ? "text-[var(--status-good)]" : "text-[var(--status-critical)]",
          )}
        >
          {isUp ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {Math.abs(delta.percent).toFixed(0)}% vs {delta.periodLabel}
        </p>
      )}
      {delta && isFlat && (
        <p className="mt-1.5 text-xs font-medium text-muted">Same as {delta.periodLabel}</p>
      )}
      {subtitle && !delta && <p className="mt-1.5 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}
