import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import FeeRecordModel from "@/models/FeeRecord";
import StudentModel from "@/models/Student";

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

  // ensure all months from earliest admission/record up to now are present
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // fetch only active students and derive earliest admission
  const studentsAll = await StudentModel.find({ status: "active" }).select("monthlyFee scholarshipPercent admissionDate status").lean();
  const earliestStudent = (studentsAll || []).reduce((min: Date | null, s: any) => {
    const d = s?.admissionDate ? new Date(s.admissionDate) : null;
    if (!d) return min;
    if (!min || d < min) return d;
    return min;
  }, null as Date | null);

  // determine start month: earliest of existing fee records or earliest student admission; fallback to current
  let startYear = currentYear;
  let startMonth = currentMonth;
  if (totals.length > 0) {
    const earliestRecord = totals.reduce((min: any, t: any) => {
      if (!min) return t;
      if (t._id.year < min._id.year) return t;
      if (t._id.year === min._id.year && t._id.month < min._id.month) return t;
      return min;
    }, null);
    if (earliestRecord) {
      startYear = earliestRecord._id.year;
      startMonth = earliestRecord._id.month;
    }
  }
  if (earliestStudent) {
    const y = earliestStudent.getFullYear();
    const m = earliestStudent.getMonth() + 1;
    if (y < startYear || (y === startYear && m < startMonth)) {
      startYear = y;
      startMonth = m;
    }
  }

  // helper to create key string
  const keyOf = (y: number, m: number) => `${y}-${m}`;
  const existingKeys = new Set((totals || []).map((t: any) => keyOf(t._id.year, t._id.month)));

  // Get all fee records to check for outstanding amounts
  const allFeeRecords = await FeeRecordModel.find({}).lean();
  const feeRecordsByMonth = new Map<string, any[]>();
  allFeeRecords.forEach((record: any) => {
    const key = keyOf(record.year, record.month);
    if (!feeRecordsByMonth.has(key)) {
      feeRecordsByMonth.set(key, []);
    }
    feeRecordsByMonth.get(key)!.push(record);
  });

  // iterate months from start to current, injecting missing months
  let y = startYear;
  let m = startMonth;
  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    const key = keyOf(y, m);
    if (!existingKeys.has(key)) {
      // students admitted on or before this month (active students only)
      const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
      const studentsForMonth = (studentsAll || []).filter((s: any) => {
        return s?.admissionDate ? new Date(s.admissionDate) <= monthEnd : false;
      });
      
      // Calculate outstanding: for each student, check if they have a fee record
      // If no record, count their monthly fee (after scholarship) as outstanding
      // If record exists, count the difference between amountDue and amountPaid
      const recordsForMonth = feeRecordsByMonth.get(key) || [];
      const studentIdToRecord = new Map(
        recordsForMonth.map((r: any) => [r.student?.toString(), r])
      );
      
      const outstandingForMonth = (studentsForMonth || []).reduce((sum: number, s: any) => {
        const record = studentIdToRecord.get(s._id?.toString());
        if (record) {
          // Student has a fee record - calculate outstanding from record
          const outstanding = Math.max(0, (record.amountDue || 0) - (record.amountPaid || 0));
          return sum + outstanding;
        } else {
          // No fee record - count monthly fee after scholarship as outstanding
          const fee = Number(s.monthlyFee || 0);
          const scholarship = Number(s.scholarshipPercent || 0) / 100;
          return sum + Math.max(0, fee - fee * scholarship);
        }
      }, 0);
      
      totals.push({ _id: { year: y, month: m }, collected: 0, outstanding: outstandingForMonth });
      existingKeys.add(key);
    } else {
      // Month exists in totals, but we need to recalculate outstanding to include students without records
      const existingTotal = totals.find((t: any) => t._id.year === y && t._id.month === m);
      if (existingTotal) {
        const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
        const studentsForMonth = (studentsAll || []).filter((s: any) => {
          return s?.admissionDate ? new Date(s.admissionDate) <= monthEnd : false;
        });
        
        const recordsForMonth = feeRecordsByMonth.get(key) || [];
        const studentIdToRecord = new Map(
          recordsForMonth.map((r: any) => [r.student?.toString(), r])
        );
        
        // Recalculate outstanding to include all active students
        const outstandingForMonth = (studentsForMonth || []).reduce((sum: number, s: any) => {
          const record = studentIdToRecord.get(s._id?.toString());
          if (record) {
            const outstanding = Math.max(0, (record.amountDue || 0) - (record.amountPaid || 0));
            return sum + outstanding;
          } else {
            const fee = Number(s.monthlyFee || 0);
            const scholarship = Number(s.scholarshipPercent || 0) / 100;
            return sum + Math.max(0, fee - fee * scholarship);
          }
        }, 0);
        
        existingTotal.outstanding = outstandingForMonth;
      }
    }
    // increment month
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  // keep totals sorted
  totals.sort((a: any, b: any) => b._id.year - a._id.year || b._id.month - a._id.month);

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

