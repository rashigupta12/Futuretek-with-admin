// app/api/jyotishi/dashboard/route.ts
/*eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  CoursesTable,
  PayoutsTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - Dashboard summary
export async function GET(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";

    // Overall statistics
    const [stats] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
        pendingEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PENDING' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        paidEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PAID' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(CommissionsTable)
      .where(eq(CommissionsTable.jyotishiId, jyotishiId));

    // This month stats
    const [thisMonthStats] = await db
      .select({
        earnings: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
        sales: sql<number>`COUNT(*)`,
      })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          sql`${CommissionsTable.createdAt} >= DATE_TRUNC('month', CURRENT_DATE)`
        )
      );

    // Active coupons count
    const [couponsCount] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${CouponsTable.isActive} = true)`,
      })
      .from(CouponsTable)
      .where(eq(CouponsTable.createdBy, jyotishiId));

    // Total students
    const [studentsCount] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${CommissionsTable.studentId})`,
      })
      .from(CommissionsTable)
      .where(eq(CommissionsTable.jyotishiId, jyotishiId));

    // Recent activity (last 5 commissions)
    const recentActivity = await db
      .select({
        id: CommissionsTable.id,
        amount: CommissionsTable.commissionAmount,
        courseName: CoursesTable.title,
        studentName: UsersTable.name,
        status: CommissionsTable.status,
        createdAt: CommissionsTable.createdAt,
      })
      .from(CommissionsTable)
      .leftJoin(CoursesTable, eq(CommissionsTable.courseId, CoursesTable.id))
      .leftJoin(UsersTable, eq(CommissionsTable.studentId, UsersTable.id))
      .where(eq(CommissionsTable.jyotishiId, jyotishiId))
      .orderBy(desc(CommissionsTable.createdAt))
      .limit(5);

    // Pending payout requests
    const [pendingPayouts] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(${PayoutsTable.amount}), 0)`,
      })
      .from(PayoutsTable)
      .where(
        and(
          eq(PayoutsTable.jyotishiId, jyotishiId),
          eq(PayoutsTable.status, "PENDING")
        )
      );

    return NextResponse.json(
      {
        stats,
        thisMonth: thisMonthStats,
        coupons: couponsCount,
        students: studentsCount,
        recentActivity,
        pendingPayouts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}