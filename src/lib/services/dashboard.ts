import StudentModel from "@/models/Student";
import FeeRecordModel from "@/models/FeeRecord";
import TeacherModel from "@/models/Teacher";
import ExpenseModel from "@/models/Expense";
import { connectDB } from "@/lib/db";

export const getDashboardOverview = async () => {
  await connectDB();
  const [students, teachers, feeCollection, expenses] =
    await Promise.all([
      StudentModel.countDocuments({ status: "active" }),
      TeacherModel.countDocuments({ status: "active" }),
      FeeRecordModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
            outstanding: {
              $sum: { $subtract: ["$amountDue", "$amountPaid"] },
            },
          },
        },
      ]),
      ExpenseModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

  const feeTotals = feeCollection[0] || { total: 0, outstanding: 0 };
  const expenseTotal = expenses[0]?.total || 0;

  return {
    students,
    teachers,
    feeCollected: feeTotals.total,
    feeOutstanding: feeTotals.outstanding,
    totalExpenses: expenseTotal,
    net: feeTotals.total - expenseTotal,
  };
};

