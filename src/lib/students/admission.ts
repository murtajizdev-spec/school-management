import StudentModel from "@/models/Student";

const ADMISSION_PREFIX = "MR-";
const PAD_WIDTH = 5;

export const getNextAdmissionNo = async () => {
  const latest = await StudentModel.aggregate<{ num: number }>([
    { $match: { admissionNo: { $regex: `^${ADMISSION_PREFIX}\\d+$` } } },
    {
      $addFields: {
        num: {
          $toInt: { $substr: ["$admissionNo", ADMISSION_PREFIX.length, PAD_WIDTH + 2] },
        },
      },
    },
    { $sort: { num: -1 } },
    { $limit: 1 },
  ]);

  const nextNum = (latest[0]?.num ?? 0) + 1;
  const padded = String(nextNum).padStart(PAD_WIDTH, "0");
  return `${ADMISSION_PREFIX}${padded}`;
};

export const formatAdmissionNo = (num: number) => {
  return `${ADMISSION_PREFIX}${String(num).padStart(PAD_WIDTH, "0")}`;
};


