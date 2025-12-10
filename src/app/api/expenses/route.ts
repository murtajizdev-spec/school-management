import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ExpenseModel from "@/models/Expense";
import { expenseSchema } from "@/lib/validators/expense";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const match: Record<string, unknown> = {};
  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  if (monthParam || yearParam) {
    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const start =
      month !== undefined
        ? startOfMonth(new Date(year, (month ?? 1) - 1, 1))
        : startOfYear(new Date(year, 0, 1));
    const end =
      month !== undefined
        ? endOfMonth(new Date(year, (month ?? 1) - 1, 1))
        : endOfYear(new Date(year, 0, 1));

    match.incurredOn = { $gte: start, $lte: end };
  }

  const expenses = await ExpenseModel.find(match).sort({ incurredOn: -1 });

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = expenseSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();

  const expense = await ExpenseModel.create(parsed.data);

  return NextResponse.json(expense, { status: 201 });
}

