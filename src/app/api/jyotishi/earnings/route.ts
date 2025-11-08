
// app/api/jyotishi/earnings/route.ts
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  CoursesTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - Get commission earnings
export async function GET(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build conditions
    const conditions = [eq(CommissionsTable.jyotishiId, jyotishiId)];

    if (startDate) {
      conditions.push(
        sql`${CommissionsTable.createdAt} >= ${new Date(startDate)}`
      );
    }
    if (endDate) {
      conditions.push(
        sql`${CommissionsTable.createdAt} <= ${new Date(endDate)}`
      );
    }

    // Overall statistics
    const [stats] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
        pendingEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PENDING' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        paidEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PAID' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(CommissionsTable)
      .where(and(...conditions));

    // Recent commissions
    const recentCommissions = await db
      .select({
        id: CommissionsTable.id,
        saleAmount: CommissionsTable.saleAmount,
        commissionAmount: CommissionsTable.commissionAmount,
        status: CommissionsTable.status,
        courseName: CoursesTable.title,
        studentName: UsersTable.name,
        couponCode: CouponsTable.code,
        createdAt: CommissionsTable.createdAt,
        paidAt: CommissionsTable.paidAt,
      })
      .from(CommissionsTable)
      .leftJoin(CoursesTable, eq(CommissionsTable.courseId, CoursesTable.id))
      .leftJoin(UsersTable, eq(CommissionsTable.studentId, UsersTable.id))
      .leftJoin(CouponsTable, eq(CommissionsTable.couponId, CouponsTable.id))
      .where(and(...conditions))
      .orderBy(desc(CommissionsTable.createdAt))
      .limit(20);

    return NextResponse.json(
      {
        stats,
        recentCommissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}