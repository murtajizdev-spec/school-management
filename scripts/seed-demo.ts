import "dotenv/config";
import { connectDB, disconnectDB } from "../src/lib/db";
import StudentModel from "../src/models/Student";
import TeacherModel from "../src/models/Teacher";
import FeeRecordModel from "../src/models/FeeRecord";
import SalaryPaymentModel from "../src/models/SalaryPayment";
import ExpenseModel from "../src/models/Expense";

const STUDENT_TARGET = 200;
const TEACHER_TARGET = 30;

const FIRST_NAMES = [
  "Adeel",
  "Bilal",
  "Farhan",
  "Hassan",
  "Imran",
  "Junaid",
  "Kamran",
  "Laiba",
  "Maria",
  "Nadia",
  "Osama",
  "Parvez",
  "Rida",
  "Saad",
  "Talha",
  "Usman",
  "Waleed",
  "Yasmin",
  "Zara",
  "Zeeshan",
];

const LAST_NAMES = [
  "Ahmed",
  "Ali",
  "Anwar",
  "Bhatti",
  "Chaudhry",
  "Farooq",
  "Habib",
  "Iqbal",
  "Javed",
  "Khan",
  "Mughal",
  "Nasir",
  "Qureshi",
  "Rashid",
  "Saeed",
  "Shaikh",
  "Tariq",
  "Yousaf",
  "Zaman",
];

const CLASS_GROUPS = [
  "Arts",
  "Science",
  "ICS",
  "Pre-Engineering",
  "Pre-Medical",
];

const CLASS_LABELS = ["XI-A", "XI-B", "XI-C", "XII-A", "XII-B", "XII-C"];

const QUALIFICATIONS = [
  "MSc Physics",
  "MSc Mathematics",
  "MSc Chemistry",
  "BS Computer Science",
  "MA English",
  "MBA",
];

const SUBJECT_POOL = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Pakistan Studies",
  "Islamiat",
  "Statistics",
];

const randomFrom = <T,>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

const randomDateBetween = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const uniqueAdmissionNo = (index: number) =>
  `MR-${(index + 1).toString().padStart(5, "0")}`;

const monthsToSeed = (count: number) => {
  const result: { month: number; year: number }[] = [];
  const now = new Date();
  let m = now.getMonth() + 1; // 1-12
  let y = now.getFullYear();
  while (result.length < count) {
    if (m === 12) {
      // skip December per requirement
      m = 11;
    }
    result.push({ month: m, year: y });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return result;
};

const MONTHS_FOR_FEE_HISTORY = 11;
const MONTHS_FOR_SALARY_HISTORY = 11;
const MONTH_HISTORY_FEE = monthsToSeed(MONTHS_FOR_FEE_HISTORY);
const MONTH_HISTORY_SALARY = monthsToSeed(MONTHS_FOR_SALARY_HISTORY);

const makeStudent = (index: number) => {
  const status = Math.random() > 0.92 ? "left" : "active";
  const admissionFee = randomInt(3000, 9000);
  const monthlyFee = randomInt(2500, 6000);
  const admissionDate = randomDateBetween(
    new Date(new Date().getFullYear() - 1, 0, 1),
    new Date()
  );
  return {
    admissionNo: uniqueAdmissionNo(index),
    name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
    classGroup: randomFrom(CLASS_GROUPS),
    className: randomFrom(CLASS_LABELS),
    dob: randomDateBetween(new Date(2004, 0, 1), new Date(2009, 11, 31)),
    cellNo: `03${randomDigits(9)}`,
    bFormNo: `${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)}`,
    fatherName: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
    fatherCnic: `${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)}`,
    fatherCellNo: `03${randomDigits(9)}`,
    admissionFee,
    monthlyFee,
    admissionDate,
    status,
    notes:
      status === "left"
        ? "Student moved to another city."
        : "Admitted through Autumn campaign.",
    lastFeePaidOn:
      status === "active"
        ? randomDateBetween(
            new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
            new Date()
          )
        : undefined,
  };
};

const makeTeacher = (index: number) => {
  const subjects = SUBJECT_POOL.sort(() => 0.5 - Math.random()).slice(
    0,
    randomInt(1, 3)
  );
  const status = Math.random() > 0.9 ? "left" : "active";
  return {
    name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
    cnic: `${randomDigits(5)}-${randomDigits(7)}-${randomDigits(1)}${index}`,
    qualification: randomFrom(QUALIFICATIONS),
    experience: `${randomInt(2, 12)} years classroom experience`,
    salary: randomInt(30000, 90000),
    subjects,
    status,
    joinedOn: randomDateBetween(new Date(2018, 0, 1), new Date()),
    leftOn:
      status === "left"
        ? randomDateBetween(new Date(2022, 0, 1), new Date())
        : undefined,
  };
};

const makeFeeRecords = (students: { _id: any; monthlyFee: number }[]) => {
  const records: any[] = [];
  MONTH_HISTORY_FEE.forEach(({ month, year }) => {
    students.forEach((student, idx) => {
      const amountDue = student.monthlyFee;
      const isPaid = Math.random() > 0.18;
      const paidPortion = isPaid
        ? amountDue
        : Math.max(0, Math.floor(amountDue * Math.random() * 0.6));
      records.push({
        student: student._id,
        month,
        year,
        amountDue,
        amountPaid: paidPortion,
        slipNumber: `FEE-${year}${month.toString().padStart(2, "0")}-${idx + 1}`,
        method: "cash",
        paidOn: isPaid
          ? new Date(year, month - 1, randomInt(1, 25))
          : undefined,
        status:
          paidPortion >= amountDue
            ? "paid"
            : paidPortion === 0
            ? "pending"
            : "partial",
      });
    });
  });
  return records;
};

const makeSalaryPayments = (teachers: { _id: any; salary: number }[]) => {
  const slips: any[] = [];
  MONTH_HISTORY_SALARY.forEach(({ month, year }) => {
    teachers.forEach((teacher, idx) => {
      slips.push({
        teacher: teacher._id,
        month,
        year,
        amount: teacher.salary,
        paidOn: new Date(year, month - 1, randomInt(1, 25)),
        slipNumber: `SAL-${year}${month.toString().padStart(2, "0")}-${idx + 1}`,
        remarks: "Auto-generated demo salary",
      });
    });
  });
  return slips;
};

async function seed() {
  await connectDB();

  const [existingStudents, existingTeachers] = await Promise.all([
    StudentModel.countDocuments(),
    TeacherModel.countDocuments(),
  ]);

  const studentsNeeded = Math.max(0, STUDENT_TARGET - existingStudents);
  const teachersNeeded = Math.max(0, TEACHER_TARGET - existingTeachers);

  if (studentsNeeded > 0) {
    const studentPayload = Array.from({ length: studentsNeeded }, (_, idx) =>
      makeStudent(existingStudents + idx)
    );
    await StudentModel.insertMany(studentPayload);
    console.log(`Added ${studentsNeeded} demo students.`);
  }

  if (teachersNeeded > 0) {
    const teacherPayload = Array.from({ length: teachersNeeded }, (_, idx) =>
      makeTeacher(existingTeachers + idx)
    );
    await TeacherModel.insertMany(teacherPayload);
    console.log(`Added ${teachersNeeded} demo teachers.`);
  }

  // Recompute counts and seed fee/salary history
  const [students, teachers] = await Promise.all([
    StudentModel.find({}, { _id: 1, monthlyFee: 1 }).lean(),
    TeacherModel.find({}, { _id: 1, salary: 1, name: 1 }).lean(),
  ]);

  // Clear existing records for the months we're seeding to avoid duplicates
  const monthYearOr = Array.from(
    new Map(
      [...MONTH_HISTORY_FEE, ...MONTH_HISTORY_SALARY].map(({ month, year }) => [
        `${year}-${month}`,
        { month, year },
      ])
    ).values()
  );
  await Promise.all([
    FeeRecordModel.deleteMany({ $or: monthYearOr }),
    SalaryPaymentModel.deleteMany({ $or: monthYearOr }),
    ExpenseModel.deleteMany({
      category: "teacher-salary",
      slipNumber: { $regex: "^SAL-" },
    }),
  ]);

  const feeRecords = makeFeeRecords(students);
  const salarySlips = makeSalaryPayments(teachers);

  if (feeRecords.length > 0) {
    await FeeRecordModel.insertMany(feeRecords);
    console.log(
      `Added ${feeRecords.length} fee records for last ${MONTHS_FOR_FEE_HISTORY} months (excluding December).`
    );
  }

  if (salarySlips.length > 0) {
    const teacherNameMap = new Map(
      teachers.map((t: any) => [t._id.toString(), (t as any).name || "Teacher"])
    );

    const salaryExpenses = salarySlips.map((slip) => {
      const teacherName = teacherNameMap.get(slip.teacher.toString()) || "Teacher";
      return {
        title: `Salary - ${teacherName}`,
        category: "teacher-salary" as const,
        amount: slip.amount,
        incurredOn: slip.paidOn || new Date(slip.year, slip.month - 1, randomInt(1, 25)),
        slipNumber: slip.slipNumber,
        notes: "Auto-generated salary expense",
      };
    });

    const expenseDocs = await ExpenseModel.insertMany(salaryExpenses);
    expenseDocs.forEach((exp, idx) => {
      salarySlips[idx].expenseId = exp._id;
    });

    await SalaryPaymentModel.insertMany(salarySlips);
    console.log(
      `Added ${salarySlips.length} salary payments + expenses for last ${MONTHS_FOR_SALARY_HISTORY} months (excluding December).`
    );
  }

  await disconnectDB();
}

seed()
  .then(() => {
    console.log("Seeding completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });


