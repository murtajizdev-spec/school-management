import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SalaryPaymentModel from "@/models/SalaryPayment";
import TeacherModel from "@/models/Teacher";
import ExpenseModel from "@/models/Expense";
import { salaryPaymentSchema } from "@/lib/validators/salary";
import { generateSlipNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  const query: Record<string, unknown> = {};

  if (teacherId && Types.ObjectId.isValid(teacherId)) {
    query.teacher = teacherId;
  }

  const payments = await SalaryPaymentModel.find(query)
    .populate("teacher")
    .sort({ paidOn: -1 });

  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = salaryPaymentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(parsed.data.teacherId)) {
    return NextResponse.json({ error: "Invalid teacher" }, { status: 400 });
  }

  await connectDB();

  const teacher = await TeacherModel.findById(parsed.data.teacherId);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const existing = await SalaryPaymentModel.findOne({
    teacher: parsed.data.teacherId,
    month: parsed.data.month,
    year: parsed.data.year,
  });

  if (existing) {
    return NextResponse.json(
      { error: "Payment already exists for this period" },
      { status: 409 }
    );
  }

  const slipNumber = generateSlipNumber("SAL");

  const payment = await SalaryPaymentModel.create({
    teacher: parsed.data.teacherId,
    month: parsed.data.month,
    year: parsed.data.year,
    amount: parsed.data.amount,
    remarks: parsed.data.remarks,
    slipNumber,
    paidOn: new Date(),
  });

  await payment.populate("teacher");

  // Set expense date to the first day of the salary payment month/year in UTC
  // Using UTC at noon (12:00) ensures the date is always in the correct month
  // regardless of server timezone, preventing timezone conversion issues
  const expenseDate = new Date(Date.UTC(parsed.data.year, parsed.data.month - 1, 1, 12, 0, 0));

  const expense = await ExpenseModel.create({
    title: `Salary: ${teacher.name}`,
    category: "teacher-salary",
    amount: parsed.data.amount,
    notes: parsed.data.remarks,
    incurredOn: expenseDate,
    slipNumber,
  });

  payment.set("expenseId", expense._id, { strict: false });
  await payment.save();

  return NextResponse.json(payment, { status: 201 });
}

