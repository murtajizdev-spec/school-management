import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { PaymentMethod } from "@/types/enums";

export interface IFeeRecord extends Document {
  student: Types.ObjectId;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  admissionFeePortion?: number;
  scholarshipPercent?: number;
  scholarshipAmount?: number;
  paidOn?: Date;
  method: PaymentMethod;
  slipNumber: string;
  remarks?: string;
  status: "pending" | "paid" | "partial";
  createdAt: Date;
  updatedAt: Date;
}

const FeeRecordSchema = new Schema<IFeeRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    admissionFeePortion: { type: Number },
    scholarshipPercent: { type: Number, default: 0, min: 0, max: 100 },
    scholarshipAmount: { type: Number, default: 0 },
    paidOn: { type: Date },
    method: {
      type: String,
      enum: ["cash", "bank-transfer", "online", "other"],
      default: "cash",
    },
    slipNumber: { type: String, required: true },
    remarks: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },
  },
  { timestamps: true }
);

FeeRecordSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

const FeeRecordModel: Model<IFeeRecord> =
  mongoose.models.FeeRecord ||
  mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema);

export default FeeRecordModel;

