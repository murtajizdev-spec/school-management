import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { connectDB } from "@/lib/db";

export const ensureDefaultAdmin = async () => {
  await connectDB();

  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await UserModel.findOne({ email });
  if (existing) {
    // Only sync password if user is still using initial password
    // Don't reset password if user has already changed it
    if (existing.isInitialPassword) {
      const matches = await bcrypt.compare(password, existing.password);
      if (!matches) {
        existing.password = hashed;
        existing.lastPasswordChange = new Date();
        await existing.save();
        console.log("Default admin password re-synced from environment variable.");
      }
    }
    return;
  }

  await UserModel.create({
    name: "Morning Roots Admin",
    email,
    password: hashed,
    role: "admin",
    lastPasswordChange: new Date(),
    isInitialPassword: true,
  });
  console.log("Default admin user created.");
};

