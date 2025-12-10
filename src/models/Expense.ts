import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
  title: string;
  category: "teacher-salary" | "operations" | "utilities" | "other";
  amount: number;
  incurredOn: Date;
  notes?: string;
  slipNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["teacher-salary", "operations", "utilities", "other"],
      default: "other",
    },
    amount: { type: Number, required: true },
    incurredOn: { type: Date, default: () => new Date() },
    notes: { type: String },
    slipNumber: { type: String },
  },
  { timestamps: true }
);

const ExpenseModel: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default ExpenseModel;

