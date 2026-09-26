"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyTotal } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";

interface TrendChartProps {
  data: MonthlyTotal[];
}

interface TooltipPayloadItem {
  payload: MonthlyTotal;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-hairline bg-surface px-3 py-2 shadow-md">
      <p className="text-xs text-secondary">{item.label}</p>
      <p className="text-sm font-semibold text-primary">{formatCurrency(item.amount)}</p>
    </div>
  );
}

function compactCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(value)}`;
}

function EndDot(props: { cx?: number; cy?: number; index?: number; dataLength: number }) {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1 || cx == null || cy == null) return <g />;
  return (
    <circle cx={cx} cy={cy} r={4} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
  );
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No spending data for this selection.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 260 }} className="bg-chart-surface">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--baseline)" }}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={compactCurrency}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--text-muted)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent)"
            fillOpacity={0.1}
            dot={(props: { cx?: number; cy?: number; index?: number }) => (
              <EndDot key={`dot-${props.index}`} {...props} dataLength={data.length} />
            )}
            activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
