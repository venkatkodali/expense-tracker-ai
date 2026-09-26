"use client";

import { useCallback, useEffect, useState } from "react";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import type { Expense, ExpenseInput } from "@/lib/types";
import { generateId } from "@/lib/utils";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load once on mount (client only).
  useEffect(() => {
    const { expenses: loaded, error } = loadExpenses();
    setExpenses(loaded);
    setLoadError(error);
    setIsLoading(false);
  }, []);

  // Persist on every change, but not before the initial load has completed.
  //
  // This gate must be real state (`isLoading`), not a ref flipped inside the
  // load effect: a ref mutates synchronously, so under React's mount ->
  // cleanup -> mount cycle (Strict Mode, on by default here) this effect
  // would see the guard already open on the *first* pass, while its own
  // `expenses` closure still held the stale initial `[]` - overwriting
  // freshly loaded storage with an empty array before the loaded state had
  // even rendered. Gating on `isLoading` state instead means both `isLoading`
  // and `expenses` always update in the same render, so this effect never
  // observes one without the other.
  useEffect(() => {
    if (isLoading) return;
    const { error } = saveExpenses(expenses);
    setSaveError(error);
  }, [expenses, isLoading]);

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
