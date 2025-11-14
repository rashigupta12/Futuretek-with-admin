// app/api/admin/certificate-requests/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { CertificateRequestsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, processedBy, notes } = await request.json();
    
    await db
      .update(CertificateRequestsTable)
      .set({
        status,
        processedAt: status === "PENDING" ? null : new Date(),
        processedBy: status === "PENDING" ? null : processedBy,
        notes,
      })
      .where(eq(CertificateRequestsTable.id, params.id));

    return NextResponse.json({ message: "Request updated successfully" });
  } catch (error) {
    console.error("Error updating certificate request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}