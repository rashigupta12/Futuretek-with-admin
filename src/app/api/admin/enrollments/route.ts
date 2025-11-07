/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnrollmentsTable } from "@/db/schema";
import { db } from "@/db";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const enrollments = await db
      .select({
        id: EnrollmentsTable.id,
        userId: EnrollmentsTable.userId,
        courseId: EnrollmentsTable.courseId,
        status: EnrollmentsTable.status,
        enrolledAt: EnrollmentsTable.enrolledAt,
        certificateIssued: EnrollmentsTable.certificateIssued,
      })
      .from(EnrollmentsTable);

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

