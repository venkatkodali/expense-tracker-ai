"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import type { AddCategoryResult, CategoriesApi } from "@/hooks/useCategories";
import type { CategoryInfo } from "@/lib/categories";

interface ManageCategoriesModalProps {
  categories: CategoriesApi["categories"];
  addCategory: CategoriesApi["addCategory"];
  renameCategory: CategoriesApi["renameCategory"];
  onClose: () => void;
  onRequestDelete: (category: CategoryInfo) => void;
}

export function ManageCategoriesModal({
  categories,
  addCategory,
  renameCategory,
  onClose,
  onRequestDelete,
}: ManageCategoriesModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const result: AddCategoryResult = addCategory(newLabel);
    if (!result.success) {
      setAddError(result.error);
      return;
    }
    setNewLabel("");
    setAddError(null);
  };

  const startEdit = (category: CategoryInfo) => {
    setEditingId(category.id);
    setEditValue(category.label);
    setEditError(null);
  };

  const saveEdit = (id: string) => {
    const result = renameCategory(id, editValue);
    if (!result.success) {
      setEditError(result.error);
      return;
    }
    setEditingId(null);
    setEditError(null);
  };

  return (
    <Modal title="Manage categories" onClose={onClose} maxWidthClassName="max-w-md">
      <form onSubmit={handleAdd} className="mb-4 flex items-start gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setAddError(null);
            }}
            placeholder="New category name"
            maxLength={40}
            className="w-full rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-primary outline-none focus:ring-2 ring-accent"
            aria-label="New category name"
          />
          {addError && <p className="mt-1 text-xs text-[var(--status-critical)]">{addError}</p>}
        </div>
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      <ul className="max-h-80 space-y-1.5 overflow-y-auto">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-hairline px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: `var(${c.colorVar})` }}
                aria-hidden="true"
              />
              {editingId === c.id ? (
                <div className="flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setEditError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    maxLength={40}
                    className="w-full rounded border border-hairline bg-page px-2 py-1 text-sm text-primary outline-none focus:ring-2 ring-accent"
                  />
                  {editError && <p className="mt-1 text-xs text-[var(--status-critical)]">{editError}</p>}
                </div>
              ) : (
                <span className="truncate text-sm text-primary">{c.label}</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {c.isBuiltIn ? (
                <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-muted">
                  Built-in
                </span>
              ) : editingId === c.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveEdit(c.id)}
                    className="rounded p-1 text-[var(--status-good)] hover:bg-page"
                    aria-label={`Save name for ${c.label}`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded p-1 text-muted hover:bg-page"
                    aria-label="Cancel rename"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="rounded p-1 text-muted hover:bg-page hover:text-accent"
                    aria-label={`Rename ${c.label}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(c)}
                    className="rounded p-1 text-muted hover:bg-page hover:text-[var(--status-critical)]"
                    aria-label={`Delete ${c.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
