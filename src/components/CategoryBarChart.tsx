"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryTotal } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";

interface CategoryBarChartProps {
  data: CategoryTotal[];
}

interface TooltipPayloadItem {
  payload: CategoryTotal;
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

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No spending data for this selection.
      </div>
    );
  }

  // Recharts needs an explicit height; scale it with the number of bars.
  const height = Math.max(180, data.length * 48 + 24);

  return (
    <div style={{ width: "100%", height }} className="bg-chart-surface">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
          barCategoryGap={12}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tickLine={false}
            axisLine={{ stroke: "var(--baseline)" }}
            tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--gridline)", opacity: 0.4 }} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={`var(${entry.colorVar})`} />
            ))}
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(value: unknown) => formatCurrency(Number(value ?? 0))}
              style={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
