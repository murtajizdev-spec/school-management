import mongoose, { Schema, Document, Model } from "mongoose";
import { TeacherStatus } from "@/types/enums";

export interface ITeacher extends Document {
  name: string;
  cnic: string;
  qualification: string;
  experience: string;
  salary: number;
  subjects: string[];
  status: TeacherStatus;
  joinedOn: Date;
  leftOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, unique: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: Number, required: true },
    subjects: { type: [String], default: [] },
    status: { type: String, enum: ["active", "left"], default: "active" },
    joinedOn: { type: Date, default: () => new Date() },
    leftOn: { type: Date },
  },
  { timestamps: true }
);

const TeacherModel: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default TeacherModel;

