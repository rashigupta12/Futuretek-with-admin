/* eslint-disable @typescript-eslint/no-unused-vars */
import { PaymentsTable } from "@/db/schema";
import { db } from "@/db";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const payments = await db.select().from(PaymentsTable);
    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}