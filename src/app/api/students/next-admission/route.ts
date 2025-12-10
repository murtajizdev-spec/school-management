import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getNextAdmissionNo } from "@/lib/students/admission";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const admissionNo = await getNextAdmissionNo();
  return NextResponse.json({ admissionNo });
}


