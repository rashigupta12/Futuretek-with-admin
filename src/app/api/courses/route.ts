//src/app/courses/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { CoursesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    // Define allowed statuses
    const allowedStatuses = [
      "REGISTRATION_OPEN",
      "COMPLETED",
      "DRAFT",
      "UPCOMING",
      "ONGOING",
      "ARCHIVED",
    ] as const;

    type StatusType = (typeof allowedStatuses)[number];

    let courses;

    // Apply filter only if a valid status is provided
    if (statusParam && allowedStatuses.includes(statusParam as StatusType)) {
      courses = await db
        .select()
        .from(CoursesTable)
        .where(eq(CoursesTable.status, statusParam as StatusType));
    } else {
      // Otherwise, fetch all courses
      courses = await db.select().from(CoursesTable);
    }

    // ✅ Return a direct array (frontend expects this)
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
