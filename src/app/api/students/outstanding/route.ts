import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";
import { OutstandingClasswiseDTO, OutstandingStudentDTO } from "@/types/models";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const className = searchParams.get("className") ?? undefined;
  const classGroup = searchParams.get("classGroup") ?? undefined;

  await connectDB();

  const match: Record<string, unknown> = {
    $expr: { $gt: ["$amountDue", "$amountPaid"] },
  };

  if (month) {
    match.month = month;
  }
  if (year) {
    match.year = year;
  }

  const records = await FeeRecordModel.find(match)
    .populate("student")
    .lean();

  const outstandingStudents: OutstandingStudentDTO[] = [];

  for (const record of records) {
    const student = record.student as any;
    if (!student || typeof student !== "object" || student.status !== "active") {
      continue;
    }
    if (className && student.className !== className) continue;
    if (classGroup && student.classGroup !== classGroup) continue;
    const outstanding = Math.max(record.amountDue - record.amountPaid, 0);
    if (outstanding <= 0) continue;

    outstandingStudents.push({
      _id: student._id?.toString?.() ?? "",
      admissionNo: student.admissionNo,
      name: student.name,
      classGroup: student.classGroup,
      className: student.className,
      month: record.month,
      year: record.year,
      monthlyFee: student.monthlyFee,
      outstanding,
    });
  }

  const groupsMap = new Map<string, OutstandingClasswiseDTO["groups"][number]>();

  outstandingStudents.forEach((student) => {
    const key = `${student.classGroup}-${student.className}`;
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        classGroup: student.classGroup,
        className: student.className,
        students: [],
        outstandingAmount: 0,
      });
    }
    const group = groupsMap.get(key)!;
    group.students.push(student);
    group.outstandingAmount += student.outstanding;
  });

  const groups = Array.from(groupsMap.values()).sort((a, b) =>
    a.className.localeCompare(b.className)
  );

  const totals = {
    outstandingStudents: outstandingStudents.length,
    outstandingAmount: outstandingStudents.reduce((sum, s) => sum + s.outstanding, 0),
  };

  const payload: OutstandingClasswiseDTO = {
    month,
    year,
    groups,
    totals,
  };

  return NextResponse.json(payload);
}

