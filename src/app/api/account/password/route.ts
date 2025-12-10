import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import UserModel from "@/models/User";
import { connectDB } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validators/account";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = changePasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
    
    // Use findByIdAndUpdate for more reliable update
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      {
        password: hashedPassword,
        lastPasswordChange: new Date(),
        isInitialPassword: false,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Verify the password was saved correctly
    const verifyNewPassword = await bcrypt.compare(
      parsed.data.newPassword,
      updatedUser.password
    );

    if (!verifyNewPassword) {
      console.error("Password verification failed after update");
      return NextResponse.json(
        { error: "Password update failed verification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Failed to update password", details: String(error) },
      { status: 500 }
    );
  }
}

