import { z } from "zod";
import { BUILTIN_CATEGORY_IDS, type CategoryId } from "./categories";

export interface CustomCategory {
  id: CategoryId;
  label: string;
  /** CSS custom property name (no "var()" wrapper), e.g. "--cat-custom-1". */
  colorVar: string;
  createdAt: string;
}

const STORAGE_KEY = "expense-tracker:custom-categories:v1";

const customCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  colorVar: z.string().min(1),
  createdAt: z.string(),
});
const customCategoriesSchema = z.array(customCategorySchema);

export function loadCustomCategories(): CustomCategory[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = customCategoriesSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error("Failed to save custom categories", err);
  }
}

/**
 * Color assignment for user-created categories. The validated 8-slot
 * categorical palette already spends slots 1-6 on the built-ins; the first
 * two custom categories get the two remaining validated slots (7 and 8,
 * "--cat-custom-1"/"--cat-custom-2"). Per the dataviz palette's own rule -
 * never generate additional hues past the validated set - every custom
 * category after that shares a single neutral "--cat-muted" swatch and
 * relies on its text label for identity everywhere it appears, exactly like
 * an overflowing "Other" bucket would.
 */
export function assignColorVar(existingCustomCount: number): string {
  if (existingCustomCount === 0) return "--cat-custom-1";
  if (existingCustomCount === 1) return "--cat-custom-2";
  return "--cat-muted";
}

function slugify(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "category"
  );
}

/** Generates a unique id for a new category, avoiding collisions with built-ins and existing custom ids. */
export function generateCategoryId(label: string, existingIds: CategoryId[]): CategoryId {
  const base = slugify(label);
  const taken = new Set<string>([...(BUILTIN_CATEGORY_IDS as string[]), ...existingIds]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
