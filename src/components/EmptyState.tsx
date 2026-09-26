import { PlusCircle, Receipt } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-hairline py-14 text-center">
      <Receipt className="h-9 w-9 text-muted" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <PlusCircle className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
