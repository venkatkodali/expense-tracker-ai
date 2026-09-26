import { z } from "zod";

export const expenseFormSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)), "Enter a valid number")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0")
    .refine((v) => Number(v) <= 1_000_000, "Amount is too large")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use at most 2 decimal places"),
  // Not a fixed enum: categories are a runtime registry (built-in + user-
  // created), so any non-empty id the <select> actually offered is valid.
  category: z.string().min(1, "Select a category"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Keep it under 200 characters"),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
