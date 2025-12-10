import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import StudentModel from "@/models/Student";
import { studentSchema } from "@/lib/validators/student";
import { getNextAdmissionNo } from "@/lib/students/admission";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const query: Record<string, unknown> = {};
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const classGroup = searchParams.get("classGroup");
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : undefined;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { admissionNo: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (classGroup) {
    query.classGroup = classGroup;
  }

  let cursor = StudentModel.find(query).sort({ createdAt: -1 });
  if (limit && !Number.isNaN(limit)) {
    cursor = cursor.limit(limit);
  }

  const students = await cursor.lean();

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = studentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const admissionNo =
    parsed.data.admissionNo && parsed.data.admissionNo.trim().length > 0
      ? parsed.data.admissionNo.trim()
      : await getNextAdmissionNo();

  const existing = await StudentModel.findOne({
    admissionNo,
  });

  if (existing) {
    return NextResponse.json(
      { error: "Admission number already exists" },
      { status: 409 }
    );
  }

  const student = await StudentModel.create({
    ...parsed.data,
    admissionNo,
  });

  return NextResponse.json(student, { status: 201 });
}

