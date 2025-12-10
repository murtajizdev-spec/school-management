import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(3),
  category: z.enum(["teacher-salary", "operations", "utilities", "other"]),
  amount: z.number().nonnegative(),
  incurredOn: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : new Date())),
  notes: z.string().optional(),
});

