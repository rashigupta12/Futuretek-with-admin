// app/api/jyotishi/students/route.ts
/*eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - Get students using Jyotishi's coupons
export async function GET(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";

    const students = await db
      .select({
        studentId: UsersTable.id,
        studentName: UsersTable.name,
        studentEmail: UsersTable.email,
        studentMobile: UsersTable.mobile,
        totalPurchases: sql<number>`COUNT(DISTINCT ${PaymentsTable.id})`,
        totalSpent: sql<number>`COALESCE(SUM(${PaymentsTable.finalAmount}), 0)`,
        totalCommission: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
        lastPurchase: sql<Date>`MAX(${PaymentsTable.createdAt})`,
      })
      .from(PaymentsTable)
      .leftJoin(UsersTable, eq(PaymentsTable.userId, UsersTable.id))
      .leftJoin(
        CommissionsTable,
        eq(PaymentsTable.id, CommissionsTable.paymentId)
      )
      .leftJoin(CouponsTable, eq(PaymentsTable.couponId, CouponsTable.id))
      .where(
        and(
          eq(CouponsTable.createdBy, jyotishiId),
          eq(PaymentsTable.status, "COMPLETED")
        )
      )
      .groupBy(
        UsersTable.id,
        UsersTable.name,
        UsersTable.email,
        UsersTable.mobile
      )
      .orderBy(desc(sql`MAX(${PaymentsTable.createdAt})`));

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}