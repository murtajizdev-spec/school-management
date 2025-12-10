import {
  ClassGroup,
  StudentStatus,
  TeacherStatus,
  PaymentMethod,
} from "@/types/enums";

export interface StudentDTO {
  _id: string;
  admissionNo: string;
  name: string;
  classGroup: ClassGroup;
  className: string;
  dob: string;
  cellNo: string;
  bFormNo: string;
  fatherName: string;
  fatherCnic: string;
  fatherCellNo: string;
  admissionFee: number;
  monthlyFee: number;
  admissionDate: string;
  status: StudentStatus;
  notes?: string;
  lastFeePaidOn?: string;
}

export interface FeeRecordDTO {
  _id: string;
  student: StudentDTO;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  admissionFeePortion?: number;
  paidOn?: string;
  method: PaymentMethod;
  slipNumber: string;
  remarks?: string;
  status: "pending" | "paid" | "partial";
}

export interface TeacherDTO {
  _id: string;
  name: string;
  cnic: string;
  qualification: string;
  experience: string;
  salary: number;
  subjects: string[];
  status: TeacherStatus;
  joinedOn: string;
  leftOn?: string;
}

export interface SalaryPaymentDTO {
  _id: string;
  teacher: TeacherDTO;
  month: number;
  year: number;
  amount: number;
  paidOn: string;
  slipNumber: string;
  remarks?: string;
  expenseId?: string;
}

export interface ExpenseDTO {
  _id: string;
  title: string;
  category: "teacher-salary" | "operations" | "utilities" | "other";
  amount: number;
  incurredOn: string;
  notes?: string;
  slipNumber?: string;
}

export interface DashboardOverview {
  students: number;
  teachers: number;
  feeCollected: number;
  feeOutstanding: number;
  totalExpenses: number;
  net: number;
}

export interface FeeSummaryDTO {
  overall: { collected: number; outstanding: number };
  breakdown: Array<{
    _id: { year: number; month: number };
    collected: number;
    outstanding: number;
  }>;
}

export type PeriodKey =
  | "currentMonth"
  | "previousMonth"
  | "yearToDate"
  | "overall";

export interface PeriodSnapshot {
  label: string;
  month?: number;
  year?: number;
  feeCollected: number;
  feeOutstanding: number;
  expenses: number;
  expenseBreakdown: Record<string, number>;
  net: number;
}

export interface PeriodOverviewResponse {
  currentMonth: PeriodSnapshot;
  previousMonth: PeriodSnapshot;
  yearToDate: PeriodSnapshot;
  overall: PeriodSnapshot;
}

export interface ExpenseSummaryDTO {
  breakdown: Array<{
    _id: { year: number; month: number };
    total: number;
  }>;
  currentMonth: number;
  previousMonth: number;
  yearToDate: number;
  overall: number;
}

export interface OutstandingStudentDTO {
  _id: string;
  admissionNo: string;
  name: string;
  classGroup: ClassGroup;
  className: string;
  month: number;
  year: number;
  outstanding: number;
  monthlyFee: number;
}

export interface OutstandingClassGroupDTO {
  classGroup: ClassGroup;
  className: string;
  students: OutstandingStudentDTO[];
  outstandingAmount: number;
}

export interface OutstandingClasswiseDTO {
  month?: number;
  year?: number;
  groups: OutstandingClassGroupDTO[];
  totals: {
    outstandingStudents: number;
    outstandingAmount: number;
  };
}

