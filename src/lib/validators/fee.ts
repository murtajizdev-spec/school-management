import { z } from "zod";
import { PAYMENT_METHODS } from "@/types/enums";

export const feePaymentSchema = z.object({
  studentId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  amountDue: z.number().nonnegative(),
  amountPaid: z.number().nonnegative(),
  admissionFeePortion: z.number().nonnegative().optional(),
  scholarshipPercent: z.number().min(0).max(100).optional(),
  scholarshipAmount: z.number().nonnegative().optional(),
  method: z.enum(PAYMENT_METHODS).default("cash"),
  remarks: z.string().optional(),
});

export const feeFilterSchema = z.object({
  query: z.string().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).optional(),
  studentId: z.string().optional(),
});

