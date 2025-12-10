import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import StudentModel from "@/models/Student";
import { studentUpdateSchema } from "@/lib/validators/student";

const invalidIdResponse = NextResponse.json(
  { error: "Invalid student id" },
  { status: 400 }
);

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse;
  }

  await connectDB();

  const student = await StudentModel.findById(id);
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse;
  }

  const json = await request.json();
  const parsed = studentUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const student = await StudentModel.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true }
  );

  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function DELETE(_request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse;
  }

  await connectDB();

  await StudentModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}

