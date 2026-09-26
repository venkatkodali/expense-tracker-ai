"use client";

import { Modal } from "./Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} maxWidthClassName="max-w-sm">
      <p className="text-sm text-secondary">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-primary hover:bg-page"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-[var(--status-critical)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
