import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ExpenseModel from "@/models/Expense";
import { ExpenseSummaryDTO } from "@/types/models";

const totalForRange = async (range?: { start?: Date; end?: Date }) => {
  const match: Record<string, unknown> = {};
  if (range?.start || range?.end) {
    match.incurredOn = {};
    if (range.start) {
      (match.incurredOn as Record<string, Date>).$gte = range.start;
    }
    if (range.end) {
      (match.incurredOn as Record<string, Date>).$lte = range.end;
    }
  }

  const result = await ExpenseModel.aggregate<{ total: number }>([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total ?? 0;
};

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const previousDate = subMonths(now, 1);

  const [breakdown, currentMonth, previousMonth, yearToDate, overall] = await Promise.all([
    ExpenseModel.aggregate<ExpenseSummaryDTO["breakdown"][number]>([
      {
        $group: {
          _id: { year: { $year: "$incurredOn" }, month: { $month: "$incurredOn" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]),
    totalForRange({ start: startOfMonth(now), end: endOfMonth(now) }),
    totalForRange({ start: startOfMonth(previousDate), end: endOfMonth(previousDate) }),
    totalForRange({ start: startOfYear(now), end: endOfYear(now) }),
    totalForRange(),
  ]);

  const summary: ExpenseSummaryDTO = {
    breakdown,
    currentMonth,
    previousMonth,
    yearToDate,
    overall,
  };

  return NextResponse.json(summary);
}

