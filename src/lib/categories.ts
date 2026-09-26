/**
 * Built-in categories. Order matters: it maps 1:1 onto slots 1-6 of the
 * validated categorical color palette, so this order must never be
 * re-sorted or generated dynamically. User-created categories are layered
 * on top of this list at runtime - see useCategories() / customCategories.ts.
 */
export const BUILTIN_CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "transportation", label: "Transportation" },
  { id: "entertainment", label: "Entertainment" },
  { id: "shopping", label: "Shopping" },
  { id: "bills", label: "Bills" },
  { id: "other", label: "Other" },
] as const;

/**
 * A category id is either one of the fixed built-ins above or a
 * user-created slug - both are just strings at the type level. Validity is
 * enforced at runtime by the category registry (useCategories), not by the
 * type system: the set of valid ids can grow while the app is running.
 */
export type CategoryId = string;

export const BUILTIN_CATEGORY_IDS = BUILTIN_CATEGORIES.map((c) => c.id) as CategoryId[];

export function isBuiltinCategory(id: CategoryId): boolean {
  return (BUILTIN_CATEGORY_IDS as string[]).includes(id);
}

export function getBuiltinCategoryLabel(id: CategoryId): string | null {
  return BUILTIN_CATEGORIES.find((c) => c.id === id)?.label ?? null;
}

/** CSS custom property reference for a built-in category's color (theme-aware). */
export function builtinCategoryColorVar(id: CategoryId): string {
  return `--cat-${id}`;
}

/** A category (built-in or user-created) as consumed by forms, filters, lists, and charts. */
export interface CategoryInfo {
  id: CategoryId;
  label: string;
  /** CSS custom property name (no "var()" wrapper), e.g. "--cat-food". */
  colorVar: string;
  isBuiltIn: boolean;
}

export function builtinCategoryInfos(): CategoryInfo[] {
  return BUILTIN_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    colorVar: builtinCategoryColorVar(c.id),
    isBuiltIn: true,
  }));
}
