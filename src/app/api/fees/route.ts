import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";
import StudentModel from "@/models/Student";
import { feePaymentSchema, feeFilterSchema } from "@/lib/validators/fee";
import { generateSlipNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const parsedFilter = feeFilterSchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    month: searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined,
    year: searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined,
    studentId: searchParams.get("studentId") ?? undefined,
  });

  if (!parsedFilter.success) {
    return NextResponse.json(
      { error: "Invalid filter" },
      { status: 400 }
    );
  }

  const match: Record<string, unknown> = {};

  if (parsedFilter.data.query) {
    const students = await StudentModel.find(
      {
        $or: [
          { name: { $regex: parsedFilter.data.query, $options: "i" } },
          { admissionNo: { $regex: parsedFilter.data.query, $options: "i" } },
        ],
      },
      { _id: 1 }
    );

    match.$or = [
      { slipNumber: { $regex: parsedFilter.data.query, $options: "i" } },
      { student: { $in: students.map((s) => s._id) } },
    ];
  }
  if (parsedFilter.data.studentId && Types.ObjectId.isValid(parsedFilter.data.studentId)) {
    match.student = parsedFilter.data.studentId;
  }


  if (parsedFilter.data.month) {
    match.month = parsedFilter.data.month;
  }

  if (parsedFilter.data.year) {
    match.year = parsedFilter.data.year;
  }

  const fees = await FeeRecordModel.find(match)
    .populate("student")
    .sort({ paidOn: -1 })
    .lean();

  return NextResponse.json(fees);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = feePaymentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(parsed.data.studentId)) {
    return NextResponse.json({ error: "Invalid student" }, { status: 400 });
  }

  await connectDB();

  const student = await StudentModel.findById(parsed.data.studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const scholarshipPercentRaw =
    parsed.data.scholarshipPercent ?? Number(student.scholarshipPercent ?? 0);
  const scholarshipPercent = Math.min(Math.max(scholarshipPercentRaw, 0), 100);
  const scholarshipAmountRaw = parsed.data.scholarshipAmount;
  const computedScholarshipAmount = Math.max(
    ((student.monthlyFee ?? 0) * scholarshipPercent) / 100,
    0
  );
  const scholarshipAmount =
    scholarshipAmountRaw !== undefined
      ? Math.max(Math.min(scholarshipAmountRaw, student.monthlyFee), 0)
      : computedScholarshipAmount;

  const amountDue = Math.max(student.monthlyFee - scholarshipAmount, 0);

  const existingRecord = await FeeRecordModel.findOne({
    student: parsed.data.studentId,
    month: parsed.data.month,
    year: parsed.data.year,
  });

  const newAmountPaid = Math.min(
    amountDue,
    (existingRecord?.amountPaid ?? 0) + parsed.data.amountPaid
  );

  const status =
    newAmountPaid >= amountDue
      ? "paid"
      : newAmountPaid > 0
        ? "partial"
        : "pending";

  const paidOn = new Date();

  const record = await FeeRecordModel.findOneAndUpdate(
    {
      student: parsed.data.studentId,
      month: parsed.data.month,
      year: parsed.data.year,
    },
    {
      $set: {
        amountDue,
        amountPaid: newAmountPaid,
        admissionFeePortion: parsed.data.admissionFeePortion,
        scholarshipPercent: scholarshipPercent,
        scholarshipAmount,
        paidOn,
        method: parsed.data.method,
        remarks: parsed.data.remarks,
        status,
        slipNumber: generateSlipNumber("FEE"),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("student");

  student.lastFeePaidOn = paidOn;
  await student.save();

  return NextResponse.json(record, { status: 201 });
}

