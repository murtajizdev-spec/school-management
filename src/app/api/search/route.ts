import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import StudentModel from "@/models/Student";
import TeacherModel from "@/models/Teacher";
import FeeRecordModel from "@/models/FeeRecord";
import SalaryPaymentModel from "@/models/SalaryPayment";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  await connectDB();

  const regex = { $regex: query, $options: "i" };

  const [students, teachers] = await Promise.all([
    StudentModel.find(
      {
        $or: [
          { name: regex },
          { admissionNo: regex },
          { fatherName: regex },
          { fatherCnic: regex },
        ],
      },
      {
        admissionNo: 1,
        name: 1,
        classGroup: 1,
        className: 1,
        status: 1,
        monthlyFee: 1,
        admissionFee: 1,
        lastFeePaidOn: 1,
      }
    ).lean(),
    TeacherModel.find(
      {
        $or: [{ name: regex }, { cnic: regex }, { subjects: regex }],
      },
      {
        name: 1,
        cnic: 1,
        qualification: 1,
        experience: 1,
        salary: 1,
        subjects: 1,
        status: 1,
        joinedOn: 1,
        leftOn: 1,
      }
    ).lean(),
  ]);

  const studentIds = students.map((s: any) => s._id);
  const teacherIds = teachers.map((t: any) => t._id);

  const [fees, salaries] = await Promise.all([
    studentIds.length
      ? FeeRecordModel.find({ student: { $in: studentIds } })
          .populate("student")
          .sort({ year: -1, month: -1 })
          .lean()
      : [],
    teacherIds.length
      ? SalaryPaymentModel.find({ teacher: { $in: teacherIds } })
          .populate("teacher")
          .sort({ year: -1, month: -1 })
          .lean()
      : [],
  ]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const feesByStudent = new Map<string, any[]>();
  fees.forEach((fee: any) => {
    const studentId =
      (fee.student as any)?._id?.toString() ??
      (typeof fee.student === "string" ? fee.student : undefined);
    if (!studentId) return;
    const list = feesByStudent.get(studentId) ?? [];
    list.push(fee);
    feesByStudent.set(studentId, list);
  });

  const salariesByTeacher = new Map<string, any[]>();
  salaries.forEach((payment: any) => {
    const teacherId =
      (payment.teacher as any)?._id?.toString() ??
      (typeof payment.teacher === "string" ? payment.teacher : undefined);
    if (!teacherId) return;
    const list = salariesByTeacher.get(teacherId) ?? [];
    list.push(payment);
    salariesByTeacher.set(teacherId, list);
  });

  const studentsResult = students.map((student: any) => {
    const sid = student._id.toString();
    const history = (feesByStudent.get(sid) ?? []).slice(0, 24);
    const current = history.find(
      (f) => f.month === currentMonth && f.year === currentYear
    );
    return {
      type: "student" as const,
      student,
      currentMonthFee: current,
      feeHistory: history,
    };
  });

  const teachersResult = teachers.map((teacher: any) => {
    const tid = teacher._id.toString();
    const history = (salariesByTeacher.get(tid) ?? []).slice(0, 24);
    const current = history.find(
      (p) => p.month === currentMonth && p.year === currentYear
    );
    return {
      type: "teacher" as const,
      teacher,
      currentMonthSalary: current,
      salaryHistory: history,
    };
  });

  return NextResponse.json({
    query,
    students: studentsResult,
    teachers: teachersResult,
  });
}

