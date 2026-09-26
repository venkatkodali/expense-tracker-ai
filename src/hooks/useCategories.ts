"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { builtinCategoryInfos, isBuiltinCategory, type CategoryId, type CategoryInfo } from "@/lib/categories";
import {
  assignColorVar,
  generateCategoryId,
  loadCustomCategories,
  saveCustomCategories,
  type CustomCategory,
} from "@/lib/customCategories";

export interface AddCategoryResult {
  success: boolean;
  id: string | null;
  error: string | null;
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCustomCategories(loadCustomCategories());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    saveCustomCategories(customCategories);
  }, [customCategories, isLoading]);

  const categories: CategoryInfo[] = useMemo(
    () => [
      ...builtinCategoryInfos(),
      ...customCategories.map((c) => ({ id: c.id, label: c.label, colorVar: c.colorVar, isBuiltIn: false })),
    ],
    [customCategories],
  );

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const getCategory = useCallback((id: CategoryId): CategoryInfo | undefined => categoryMap.get(id), [categoryMap]);
  const getLabel = useCallback(
    (id: CategoryId): string => categoryMap.get(id)?.label ?? id,
    [categoryMap],
  );
  const getColorVar = useCallback(
    (id: CategoryId): string => categoryMap.get(id)?.colorVar ?? "--cat-muted",
    [categoryMap],
  );

  const addCategory = useCallback(
    (rawLabel: string): AddCategoryResult => {
      const label = rawLabel.trim();
      if (label.length === 0) return { success: false, id: null, error: "Enter a category name." };
      if (label.length > 40) return { success: false, id: null, error: "Keep it under 40 characters." };

      const isDuplicate = categories.some((c) => c.label.toLowerCase() === label.toLowerCase());
      if (isDuplicate) return { success: false, id: null, error: "That category already exists." };

      const id = generateCategoryId(
        label,
        customCategories.map((c) => c.id),
      );
      const colorVar = assignColorVar(customCategories.length);
      const newCategory: CustomCategory = { id, label, colorVar, createdAt: new Date().toISOString() };
      setCustomCategories((prev) => [...prev, newCategory]);
      return { success: true, id, error: null };
    },
    [categories, customCategories],
  );

  const renameCategory = useCallback(
    (id: CategoryId, rawLabel: string): { success: boolean; error: string | null } => {
      if (isBuiltinCategory(id)) return { success: false, error: "Built-in categories can't be renamed." };
      const label = rawLabel.trim();
      if (label.length === 0) return { success: false, error: "Enter a category name." };
      const isDuplicate = categories.some(
        (c) => c.id !== id && c.label.toLowerCase() === label.toLowerCase(),
      );
      if (isDuplicate) return { success: false, error: "That category already exists." };

      setCustomCategories((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)));
      return { success: true, error: null };
    },
    [categories],
  );

  /** Removes a custom category from the registry. Callers must reassign any expenses using it first. */
  const deleteCategory = useCallback((id: CategoryId): { success: boolean; error: string | null } => {
    if (isBuiltinCategory(id)) return { success: false, error: "Built-in categories can't be deleted." };
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true, error: null };
  }, []);

  return {
    categories,
    isLoading,
    getCategory,
    getLabel,
    getColorVar,
    isBuiltIn: isBuiltinCategory,
    addCategory,
    renameCategory,
    deleteCategory,
  };
}

export type CategoriesApi = ReturnType<typeof useCategories>;
