export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse-bg h-[92px] rounded-xl border border-hairline bg-surface"
        />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="animate-pulse-bg h-64 rounded-xl border border-hairline bg-surface" />;
}

export function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse-bg h-12 rounded-lg border border-hairline bg-surface" />
      ))}
    </div>
  );
}
