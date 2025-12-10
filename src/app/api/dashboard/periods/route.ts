import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";
import ExpenseModel from "@/models/Expense";
import StudentModel from "@/models/Student";
import { PeriodOverviewResponse, PeriodSnapshot } from "@/types/models";

type FeeTotals = { collected: number; outstanding: number };
type ExpenseTotals = { total: number; breakdown: Record<string, number> };

const feeTotalsForMatch = async (match: Record<string, unknown>): Promise<FeeTotals> => {
  const result = await FeeRecordModel.aggregate<{
    collected: number;
    outstanding: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: null,
        collected: { $sum: "$amountPaid" },
        outstanding: { $sum: { $subtract: ["$amountDue", "$amountPaid"] } },
      },
    },
  ]);

  if (!result.length) {
    return { collected: 0, outstanding: 0 };
  }

  return {
    collected: result[0].collected ?? 0,
    outstanding: result[0].outstanding ?? 0,
  };
};

const outstandingForMonthYear = async (month: number, year: number) => {
  const studentsWithFees = await StudentModel.aggregate<{
    outstanding: number;
  }>([
    { $match: { status: "active" } },
    {
      $lookup: {
        from: FeeRecordModel.collection.name,
        let: { studentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$student", "$$studentId"] },
                  { $eq: ["$month", month] },
                  { $eq: ["$year", year] },
                ],
              },
            },
          },
        ],
        as: "fees",
      },
    },
    { $addFields: { feeRecord: { $arrayElemAt: ["$fees", 0] } } },
    {
      $addFields: {
        outstanding: {
          $cond: [
            { $gt: [{ $size: "$fees" }, 0] },
            {
              $max: [
                {
                  $subtract: ["$feeRecord.amountDue", "$feeRecord.amountPaid"],
                },
                0,
              ],
            },
            "$monthlyFee",
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalOutstanding: { $sum: "$outstanding" },
      },
    },
  ]);

  return studentsWithFees[0]?.totalOutstanding ?? 0;
};

const expenseTotalsForRange = async (range?: { start?: Date; end?: Date }): Promise<ExpenseTotals> => {
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

  const [totalAgg, categoryAgg] = await Promise.all([
    ExpenseModel.aggregate<{ total: number }>([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    ExpenseModel.aggregate<{ _id: string; total: number }>([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
  ]);

  const total = totalAgg[0]?.total ?? 0;
  const breakdown = categoryAgg.reduce<Record<string, number>>((acc, entry) => {
    acc[entry._id] = entry.total;
    return acc;
  }, {});

  return { total, breakdown };
};

const buildSnapshot = (
  label: string,
  fee: FeeTotals,
  expenses: ExpenseTotals,
  month?: number,
  year?: number
): PeriodSnapshot => ({
  label,
  month,
  year,
  feeCollected: fee.collected,
  feeOutstanding: fee.outstanding,
  expenses: expenses.total,
  expenseBreakdown: expenses.breakdown,
  net: fee.collected - expenses.total,
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const previousDate = subMonths(now, 1);
  const previousMonth = previousDate.getMonth() + 1;
  const previousYear = previousDate.getFullYear();

  const [currentFees, previousFees, yearFees, overallFees, currentExpenses, previousExpenses, yearExpenses, overallExpenses, currentOutstandingExact] =
    await Promise.all([
      feeTotalsForMatch({ month: currentMonth, year: currentYear }),
      feeTotalsForMatch({ month: previousMonth, year: previousYear }),
      feeTotalsForMatch({ year: currentYear }),
      feeTotalsForMatch({}),
      expenseTotalsForRange({ start: startOfMonth(now), end: endOfMonth(now) }),
      expenseTotalsForRange({ start: startOfMonth(previousDate), end: endOfMonth(previousDate) }),
      expenseTotalsForRange({ start: startOfYear(now), end: endOfYear(now) }),
      expenseTotalsForRange(),
      outstandingForMonthYear(currentMonth, currentYear),
    ]);

  // Use the more accurate outstanding (counts students with no slip yet)
  currentFees.outstanding = currentOutstandingExact;

  const overview: PeriodOverviewResponse = {
    currentMonth: buildSnapshot("Current month", currentFees, currentExpenses, currentMonth, currentYear),
    previousMonth: buildSnapshot(
      "Previous month",
      previousFees,
      previousExpenses,
      previousMonth,
      previousYear
    ),
    yearToDate: buildSnapshot("Year to date", yearFees, yearExpenses, undefined, currentYear),
    overall: buildSnapshot("Overall", overallFees, overallExpenses),
  };

  return NextResponse.json(overview);
}

