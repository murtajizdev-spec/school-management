import { z } from "zod";

export const salaryPaymentSchema = z.object({
  teacherId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  amount: z.number().nonnegative(),
  remarks: z.string().optional(),
});

