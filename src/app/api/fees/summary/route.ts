import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [totals] = await Promise.all([
    FeeRecordModel.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          collected: { $sum: "$amountPaid" },
          outstanding: {
            $sum: { $subtract: ["$amountDue", "$amountPaid"] },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]),
  ]);

  const overall = totals.reduce(
    (acc, item) => {
      acc.collected += item.collected;
      acc.outstanding += item.outstanding;
      return acc;
    },
    { collected: 0, outstanding: 0 }
  );

  return NextResponse.json({ overall, breakdown: totals });
}

