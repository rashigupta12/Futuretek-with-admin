/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { CertificateRequestsTable, EnrollmentsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// app/api/user/certificates/request/route.ts
export async function POST(req: NextRequest) {
  try {
    const { enrollmentId } = await req.json();
    const userId = "user-id-from-session";

    // Verify enrollment belongs to user
    const [enrollment] = await db
      .select()
      .from(EnrollmentsTable)
      .where(
        and(
            eq(EnrollmentsTable.id, enrollmentId),
        eq(EnrollmentsTable.userId, userId)
        )
      
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if certificate already issued
    if (enrollment.certificateIssued) {
      return NextResponse.json(
        { error: "Certificate already issued" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const [existingRequest] = await db
      .select()
      .from(CertificateRequestsTable)
      .where(
        and(
          eq(CertificateRequestsTable.enrollmentId, enrollmentId),
        eq(CertificateRequestsTable.status, "PENDING")
        )
        
      )
      .limit(1);

    if (existingRequest) {
      return NextResponse.json(
        { error: "Certificate request already submitted" },
        { status: 400 }
      );
    }

    // Create certificate request
    const [request] = await db
      .insert(CertificateRequestsTable)
      .values({
        userId,
        enrollmentId,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json(
      { message: "Certificate request submitted successfully", request },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit certificate request" },
      { status: 500 }
    );
  }
}