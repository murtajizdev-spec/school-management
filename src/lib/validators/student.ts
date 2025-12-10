import { z } from "zod";
import { CLASS_GROUPS, STUDENT_STATUS } from "@/types/enums";

export const studentSchema = z.object({
  admissionNo: z.string().optional(),
  name: z.string().min(3),
  classGroup: z.enum(CLASS_GROUPS),
  className: z.string().min(1, "Class is required"),
  dob: z.string().transform((value) => new Date(value)),
  cellNo: z.string().min(10),
  bFormNo: z.string().min(5),
  fatherName: z.string().min(3),
  fatherCnic: z.string().min(5),
  fatherCellNo: z.string().min(10),
  admissionFee: z.number().nonnegative(),
  monthlyFee: z.number().nonnegative(),
  admissionDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : new Date())),
  status: z.enum(STUDENT_STATUS).default("active"),
  notes: z.string().optional(),
});

export const studentUpdateSchema = studentSchema.partial().extend({
  status: z.enum(STUDENT_STATUS).optional(),
});

