import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "staff";
  password: string;
  lastPasswordChange: Date;
  isInitialPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    password: { type: String, required: true },
    lastPasswordChange: { type: Date, default: () => new Date() },
    isInitialPassword: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;

