import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ExpenseModel from "@/models/Expense";

const invalid = NextResponse.json({ error: "Invalid id" }, { status: 400 });

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteParams) {
  const { id } = await context.params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Types.ObjectId.isValid(id)) {
    return invalid;
  }

  await connectDB();
  await ExpenseModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}

