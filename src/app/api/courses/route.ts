import { db } from "@/db";
import { CoursesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    type StatusType = "REGISTRATION_OPEN" | "COMPLETED" | "DRAFT" | "UPCOMING" | "ONGOING" | "ARCHIVED";
    const statusParam = searchParams.get("status");
    const status: StatusType = (
      statusParam === "REGISTRATION_OPEN" ||
      statusParam === "COMPLETED" ||
      statusParam === "DRAFT" ||
      statusParam === "UPCOMING" ||
      statusParam === "ONGOING" ||
      statusParam === "ARCHIVED"
        ? statusParam
        : "REGISTRATION_OPEN"
    ) as StatusType;

    const courses = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.status, status));

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
