import mongoose, { Schema, Document, Model } from "mongoose";
import { ClassGroup, StudentStatus, CLASS_NAMES } from "@/types/enums";

export interface IStudent extends Document {
  admissionNo: string;
  name: string;
  classGroup: ClassGroup;
  className: string;
  dob: Date;
  cellNo: string;
  bFormNo: string;
  fatherName: string;
  fatherCnic: string;
  fatherCellNo: string;
  admissionFee: number;
  monthlyFee: number;
  scholarshipPercent?: number;
  admissionDate: Date;
  status: StudentStatus;
  notes?: string;
  lastFeePaidOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    admissionNo: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    classGroup: {
      type: String,
      enum: ["Arts", "Science", "ICS", "Pre-Engineering", "Pre-Medical"],
      required: true,
    },
    className: { type: String, required: true, enum: CLASS_NAMES },
    dob: { type: Date, required: true },
    cellNo: { type: String, required: true },
    bFormNo: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherCnic: { type: String, required: true },
    fatherCellNo: { type: String, required: true },
    admissionFee: { type: Number, required: true },
    monthlyFee: { type: Number, required: true },
    scholarshipPercent: { type: Number, default: 0, min: 0, max: 100 },
    admissionDate: { type: Date, default: () => new Date() },
    status: { type: String, enum: ["active", "left"], default: "active" },
    notes: { type: String },
    lastFeePaidOn: { type: Date },
  },
  { timestamps: true }
);

const StudentModel: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default StudentModel;

