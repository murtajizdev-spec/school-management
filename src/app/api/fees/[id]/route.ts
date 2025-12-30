import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";
import StudentModel from "@/models/Student";

const invalid = NextResponse.json({ error: "Invalid id" }, { status: 400 });

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!Types.ObjectId.isValid(id)) {
    return invalid;
  }

  await connectDB();

  const deleted = await FeeRecordModel.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update student's lastFeePaidOn if the latest slip was removed
  const studentId = deleted.student;
  if (studentId) {
    const latest = await FeeRecordModel.findOne(
      { student: studentId, paidOn: { $exists: true } },
      {},
      { sort: { paidOn: -1 } }
    );
    await StudentModel.findByIdAndUpdate(studentId, {
      $set: { lastFeePaidOn: latest?.paidOn ?? null },
    });
  }

  return NextResponse.json({ success: true });
}


