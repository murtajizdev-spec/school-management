import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISalaryPayment extends Document {
  teacher: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  paidOn: Date;
  slipNumber: string;
  remarks?: string;
  expenseId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryPaymentSchema = new Schema<ISalaryPayment>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    paidOn: { type: Date, default: () => new Date() },
    slipNumber: { type: String, required: true },
    expenseId: { type: Schema.Types.ObjectId, ref: "Expense" },
    remarks: { type: String },
  },
  { timestamps: true }
);

SalaryPaymentSchema.index({ teacher: 1, month: 1, year: 1 }, { unique: true });

const SalaryPaymentModel: Model<ISalaryPayment> =
  mongoose.models.SalaryPayment ||
  mongoose.model<ISalaryPayment>("SalaryPayment", SalaryPaymentSchema);

export default SalaryPaymentModel;

