import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SalaryPaymentModel from "@/models/SalaryPayment";
import ExpenseModel from "@/models/Expense";

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

  const payment = await SalaryPaymentModel.findByIdAndDelete(id);

  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expenseId = payment.get("expenseId");
  if (expenseId && Types.ObjectId.isValid(expenseId)) {
    await ExpenseModel.findByIdAndDelete(expenseId);
  } else if (payment.slipNumber) {
    await ExpenseModel.deleteMany({ slipNumber: payment.slipNumber });
  }

  return NextResponse.json({ success: true });
}


