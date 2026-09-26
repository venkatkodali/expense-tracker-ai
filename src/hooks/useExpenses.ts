"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import type { Expense, ExpenseInput } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  // Load once on mount (client only).
  useEffect(() => {
    const { expenses: loaded, error } = loadExpenses();
    setExpenses(loaded);
    setLoadError(error);
    hasLoaded.current = true;
    setIsLoading(false);
  }, []);

  // Persist on every change, but not before the initial load has completed
  // (otherwise we'd overwrite storage with an empty array on first render).
  useEffect(() => {
    if (!hasLoaded.current) return;
    const { error } = saveExpenses(expenses);
    setSaveError(error);
  }, [expenses]);

  const addExpense = useCallback((input: ExpenseInput): Expense => {
    const now = new Date().toISOString();
    const expense: Expense = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e,
      ),
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    expenses,
    isLoading,
    loadError,
    saveError,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
