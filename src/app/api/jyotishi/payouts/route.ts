/*eslint-disable @typescript-eslint/no-unused-vars */
// app/api/jyotishi/payouts/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import {
  CommissionsTable,
  PayoutsTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - Get payout history
export async function GET(req: NextRequest) {
  try {
      const session = await auth()
      const jyotishiId = session?.user.id;
         if (!jyotishiId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

    const payouts = await db
      .select()
      .from(PayoutsTable)
      .where(eq(PayoutsTable.jyotishiId, jyotishiId))
      .orderBy(desc(PayoutsTable.requestedAt));

    return NextResponse.json({ payouts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

