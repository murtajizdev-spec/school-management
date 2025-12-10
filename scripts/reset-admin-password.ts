/**
 * Reset Admin Password Script
 * 
 * This script resets the admin password to match the DEFAULT_ADMIN_PASSWORD
 * environment variable. Useful if the password was changed and you need to reset it.
 * 
 * Usage:
 *   npm run reset-admin
 *   or
 *   tsx scripts/reset-admin-password.ts
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import UserModel from "../src/models/User";

async function resetAdminPassword() {
  try {
    await connectDB();

    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("❌ Error: DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in environment variables.");
      process.exit(1);
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      console.error(`❌ Error: User with email ${email} not found.`);
      console.log("💡 Creating new admin user...");
      const hashed = await bcrypt.hash(password, 10);
      await UserModel.create({
        name: "Academy Admin",
        email,
        password: hashed,
        role: "admin",
        lastPasswordChange: new Date(),
        isInitialPassword: true,
      });
      console.log("✅ Admin user created successfully!");
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.lastPasswordChange = new Date();
    user.isInitialPassword = true;
    await user.save();

    console.log("✅ Admin password reset successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${password}`);
    console.log("\n⚠️  Important: Change this password after logging in!");
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();

