import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDashboardOverview } from "@/lib/services/dashboard";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overview = await getDashboardOverview();

  return NextResponse.json(overview);
}

