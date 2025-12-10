import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import TeacherModel from "@/models/Teacher";
import { teacherSchema } from "@/lib/validators/teacher";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { cnic: { $regex: search, $options: "i" } },
      { subjects: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
  }

  if (status) {
    query.status = status;
  }

  const teachers = await TeacherModel.find(query).sort({ createdAt: -1 });

  return NextResponse.json(teachers);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = teacherSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await TeacherModel.findOne({ cnic: parsed.data.cnic });

  if (existing) {
    return NextResponse.json(
      { error: "Teacher already exists" },
      { status: 409 }
    );
  }

  const teacher = await TeacherModel.create(parsed.data);

  return NextResponse.json(teacher, { status: 201 });
}

