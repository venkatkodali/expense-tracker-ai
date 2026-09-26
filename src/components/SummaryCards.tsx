import { CalendarDays, PiggyBank, Receipt, Tag } from "lucide-react";
import { StatCard } from "./StatCard";
import type { DashboardSummary } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard label="Total spending" value={formatCurrency(summary.total)} icon={PiggyBank} />
      <StatCard
        label="This month"
        value={formatCurrency(summary.thisMonth)}
        icon={CalendarDays}
        delta={
          summary.thisMonthDeltaPercent === null
            ? null
            : { percent: summary.thisMonthDeltaPercent, goodDirection: "down", periodLabel: "last month" }
        }
      />
      <StatCard
        label="Top category"
        value={summary.topCategory ? summary.topCategory.label : "—"}
        subtitle={summary.topCategory ? formatCurrency(summary.topCategory.amount) : "No expenses yet"}
        icon={Tag}
      />
      <StatCard label="Transactions" value={String(summary.transactionCount)} icon={Receipt} />
    </div>
  );
}
