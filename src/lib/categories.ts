/**
 * Fixed category list for expenses. Order matters: it maps 1:1 onto the
 * validated categorical color palette (slots 1-6), so the order here must
 * never be re-sorted or generated dynamically.
 */
export const CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "transportation", label: "Transportation" },
  { id: "entertainment", label: "Entertainment" },
  { id: "shopping", label: "Shopping" },
  { id: "bills", label: "Bills" },
  { id: "other", label: "Other" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as CategoryId[];

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** CSS custom property reference for a category's color (theme-aware). */
export function categoryColorVar(id: CategoryId): string {
  return `var(--cat-${id})`;
}
