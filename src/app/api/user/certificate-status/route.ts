// app/api/user/certificate-status/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { CertificateRequestsTable, EnrollmentsTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    // Get enrollment details
    const enrollment = await db
      .select({
        certificateIssued: EnrollmentsTable.certificateIssued,
        certificateUrl: EnrollmentsTable.certificateUrl,
      })
      .from(EnrollmentsTable)
      .where(eq(EnrollmentsTable.id, enrollmentId))
      .limit(1);

    if (!enrollment.length) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Get latest certificate request
    const certificateRequest = await db
      .select({
        status: CertificateRequestsTable.status,
      })
      .from(CertificateRequestsTable)
      .where(eq(CertificateRequestsTable.enrollmentId, enrollmentId))
      .orderBy(desc(CertificateRequestsTable.requestedAt))
      .limit(1);

    return NextResponse.json({
      certificateIssued: enrollment[0].certificateIssued,
      certificateUrl: enrollment[0].certificateUrl,
      certificateRequestStatus: certificateRequest[0]?.status || null,
    });
  } catch (error) {
    console.error("Error fetching certificate status:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate status" },
      { status: 500 }
    );
  }
}