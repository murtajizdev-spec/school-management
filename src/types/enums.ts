export const CLASS_GROUPS = [
  "Arts",
  "Science",
  "ICS",
  "Pre-Engineering",
  "Pre-Medical",
] as const;

export type ClassGroup = (typeof CLASS_GROUPS)[number];

export const STUDENT_STATUS = ["active", "left"] as const;
export type StudentStatus = (typeof STUDENT_STATUS)[number];

export const TEACHER_STATUS = ["active", "left"] as const;
export type TeacherStatus = (typeof TEACHER_STATUS)[number];

export const PAYMENT_METHODS = [
  "cash",
  "bank-transfer",
  "online",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

