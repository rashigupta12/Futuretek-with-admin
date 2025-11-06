/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CertificateRequestsTable } from "@/db/schema";
import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const requests = await db
      .select()
      .from(CertificateRequestsTable)
      .where(eq(CertificateRequestsTable.status, "PENDING"));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch certificate requests" },
      { status: 500 }
    );
  }
}