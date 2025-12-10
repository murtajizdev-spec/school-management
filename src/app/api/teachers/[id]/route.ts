import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import TeacherModel from "@/models/Teacher";
import { teacherUpdateSchema } from "@/lib/validators/teacher";

const invalidId = NextResponse.json({ error: "Invalid id" }, { status: 400 });

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalidId;
  }

  const json = await request.json();
  const parsed = teacherUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const teacher = await TeacherModel.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true }
  );

  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(teacher);
}

export async function DELETE(_request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalidId;
  }

  await connectDB();

  await TeacherModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}

