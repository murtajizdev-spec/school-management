import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";

/**
 * API Route to reset admin password
 * This is a one-time use route to fix login issues after deployment
 * 
 * Usage: POST /api/admin/reset-password
 * Body: { password: "new-password" } (optional, uses env var if not provided)
 * 
 * SECURITY: Remove or protect this route after use in production!
 */
export async function POST(request: Request) {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!email) {
      return NextResponse.json(
        { error: "DEFAULT_ADMIN_EMAIL not configured" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const newPassword = body.password || defaultPassword;

    if (!newPassword) {
      return NextResponse.json(
        { error: "Password not provided and DEFAULT_ADMIN_PASSWORD not set" },
        { status: 400 }
      );
    }

    await connectDB();

    const hashed = await bcrypt.hash(newPassword, 10);

    const user = await UserModel.findOne({ email });

    if (!user) {
      // Create admin user if it doesn't exist
      await UserModel.create({
        name: "Morning Roots Admin",
        email,
        password: hashed,
        role: "admin",
        lastPasswordChange: new Date(),
        isInitialPassword: true,
      });

      return NextResponse.json({
        success: true,
        message: "Admin user created",
        email,
        password: newPassword,
      });
    }

    // Update existing user
    user.password = hashed;
    user.lastPasswordChange = new Date();
    user.isInitialPassword = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Admin password reset successfully",
      email,
      password: newPassword,
      warning: "Please change this password after logging in and remove this API route for security!",
    });
  } catch (error) {
    console.error("Error resetting admin password:", error);
    return NextResponse.json(
      { error: "Failed to reset password", details: String(error) },
      { status: 500 }
    );
  }
}

