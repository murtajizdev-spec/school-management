import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import StudentModel from "@/models/Student";
import FeeRecordModel from "@/models/FeeRecord";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  await connectDB();

  // Compute per-student outstanding for the requested month/year
  const studentsWithFees = await StudentModel.aggregate<{
    _id: string;
    admissionNo: string;
    name: string;
    classGroup: string;
    className: string;
    monthlyFee: number;
    outstanding: number;
    paidAmount: number;
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
        paidAmount: {
          $cond: [
            { $gt: [{ $size: "$fees" }, 0] },
            "$feeRecord.amountPaid",
            0,
          ],
        },
      },
    },
    {
      $project: {
        admissionNo: 1,
        name: 1,
        classGroup: 1,
        className: 1,
        monthlyFee: 1,
        outstanding: 1,
        paidAmount: 1,
      },
    },
    { $sort: { admissionNo: 1 } },
  ]);

  const unpaid = studentsWithFees.filter((s) => s.outstanding > 0);
  const paid = studentsWithFees.filter((s) => s.outstanding <= 0);

  const summary = {
    totalActive: studentsWithFees.length,
    paidCount: paid.length,
    unpaidCount: unpaid.length,
    paidAmount: paid.reduce((sum, s) => sum + s.paidAmount, 0),
    unpaidAmount: unpaid.reduce((sum, s) => sum + s.outstanding, 0),
  };

  return NextResponse.json({ month, year, unpaid, summary });
}



