// app/api/admin/certificates/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
  EnrollmentsTable, 
  UsersTable, 
  CoursesTable, 
  CertificateRequestsTable 
} from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

export async function GET() {
  try {
    const certificates = await db
      .select({
        id: EnrollmentsTable.id,
        enrollmentId: EnrollmentsTable.id,
        userId: EnrollmentsTable.userId,
        certificateUrl: EnrollmentsTable.certificateUrl,
        certificateIssuedAt: EnrollmentsTable.certificateIssuedAt,
        completedAt: EnrollmentsTable.completedAt,
        userName: UsersTable.name,
        userEmail: UsersTable.email,
        courseTitle: CoursesTable.title,
        courseInstructor: CoursesTable.instructor,
      })
      .from(EnrollmentsTable)
      .innerJoin(UsersTable, eq(EnrollmentsTable.userId, UsersTable.id))
      .innerJoin(CoursesTable, eq(EnrollmentsTable.courseId, CoursesTable.id))
      .where(
        and(
          eq(EnrollmentsTable.certificateIssued, true),
          isNotNull(EnrollmentsTable.certificateUrl),
          isNotNull(EnrollmentsTable.certificateIssuedAt)
        )
      )
      .orderBy(desc(EnrollmentsTable.certificateIssuedAt));

    const transformedCertificates = certificates.map(cert => ({
      id: cert.id,
      enrollmentId: cert.enrollmentId,
      userId: cert.userId,
      certificateUrl: cert.certificateUrl,
      certificateIssuedAt: cert.certificateIssuedAt,
      completedAt: cert.completedAt,
      user: {
        name: cert.userName,
        email: cert.userEmail,
      },
      course: {
        title: cert.courseTitle,
        instructor: cert.courseInstructor,
      },
    }));

    return NextResponse.json({ certificates: transformedCertificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

// app/api/admin/certificates/route.ts (Updated POST method)
export async function POST(request: Request) {
  try {
    const { requestId, adminId } = await request.json();

    // Generate a permanent file path for the certificate
    const fileName = `certificate_${requestId}_${Date.now()}.pdf`;
    const certificateUrl = `/certificates/${fileName}`;

    // In a real application, you would:
    // 1. Save the PDF file to your storage (S3, local storage, etc.)
    // 2. Store the permanent URL in the database

    // For now, we'll update the database with the URL structure
    await db
      .update(CertificateRequestsTable)
      .set({
        status: "APPROVED",
        processedAt: new Date(),
        processedBy: adminId,
      })
      .where(eq(CertificateRequestsTable.id, requestId));

    const [requestData] = await db
      .select({
        enrollmentId: CertificateRequestsTable.enrollmentId,
      })
      .from(CertificateRequestsTable)
      .where(eq(CertificateRequestsTable.id, requestId))
      .limit(1);

    if (!requestData) {
      return NextResponse.json(
        { error: "Certificate request not found" },
        { status: 404 }
      );
    }

    // Update enrollment with certificate details
    await db
      .update(EnrollmentsTable)
      .set({
        certificateIssued: true,
        certificateIssuedAt: new Date(),
        certificateUrl, // This should be a permanent URL
      })
      .where(eq(EnrollmentsTable.id, requestData.enrollmentId));

    return NextResponse.json(
      { 
        message: "Certificate generated successfully",
        certificateUrl 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}