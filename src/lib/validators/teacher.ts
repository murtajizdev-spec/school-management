import { z } from "zod";
import { TEACHER_STATUS } from "@/types/enums";

export const teacherSchema = z.object({
  name: z.string().min(3),
  cnic: z.string().min(5),
  qualification: z.string().min(2),
  experience: z.string().min(1),
  salary: z.number().nonnegative(),
  subjects: z
    .union([z.array(z.string()), z.string()])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }
      return value
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);
    })
    .default([]),
  status: z.enum(TEACHER_STATUS).default("active"),
  joinedOn: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : new Date())),
});

export const teacherUpdateSchema = teacherSchema.partial();

