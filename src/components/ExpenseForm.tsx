"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CATEGORIES } from "@/lib/categories";
import type { ExpenseInput } from "@/lib/types";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/validation";
import { toIsoDate } from "@/lib/utils";

interface ExpenseFormProps {
  initialValues?: ExpenseInput;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-hairline bg-page px-3 py-2 text-sm text-primary outline-none focus:ring-2 ring-accent";
const labelClass = "mb-1 block text-sm font-medium text-primary";
const errorClass = "mt-1 text-xs text-[var(--status-critical)]";

export function ExpenseForm({ initialValues, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: initialValues?.date ?? toIsoDate(new Date()),
      amount: initialValues ? String(initialValues.amount) : "",
      category: initialValues?.category ?? CATEGORIES[0].id,
      description: initialValues?.description ?? "",
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      date: values.date,
      amount: Math.round(Number(values.amount) * 100) / 100,
      category: values.category as ExpenseInput["category"],
      description: values.description.trim(),
    });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className={labelClass}>
            Date
          </label>
          <input
            id="date"
            type="date"
            className={inputClass}
            max={toIsoDate(new Date())}
            {...register("date")}
            aria-invalid={!!errors.date}
          />
          {errors.date && <p className={errorClass}>{errors.date.message}</p>}
        </div>
        <div>
          <label htmlFor="amount" className={labelClass}>
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={`${inputClass} pl-6`}
              {...register("amount")}
              aria-invalid={!!errors.amount}
            />
          </div>
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          className={inputClass}
          {...register("category")}
          aria-invalid={!!errors.category}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.category && <p className={errorClass}>{errors.category.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="e.g. Groceries at Whole Foods"
          className={inputClass}
          {...register("description")}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-primary hover:bg-page"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
