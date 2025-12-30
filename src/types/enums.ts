export const CLASS_GROUPS = [
  "Arts",
  "Science",
  "ICS",
  "Pre-Engineering",
  "Pre-Medical",
] as const;

export type ClassGroup = (typeof CLASS_GROUPS)[number];

export const CLASS_NAMES = [
  "PG",
  "Nursery",
  "Prep",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
] as const;
export type ClassName = (typeof CLASS_NAMES)[number];

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

