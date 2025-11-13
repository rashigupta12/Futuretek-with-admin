/*eslint-disable  @typescript-eslint/no-explicit-any*/
// app/api/jyotishi/earnings/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  CoursesTable,
  UsersTable,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const jyotishiId = session?.user?.id;
    if (!jyotishiId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const offset = (page - 1) * limit;

    // ---------- base conditions ----------
    const conds: any[] = [eq(CommissionsTable.jyotishiId, jyotishiId)];
    if (start) conds.push(sql`${CommissionsTable.createdAt} >= ${new Date(start)}`);
    if (end) conds.push(sql`${CommissionsTable.createdAt} <= ${new Date(end)}`);

    // ---------- aggregated stats ----------
    const [stats] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}),0)`.mapWith(Number),
        pendingEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status}='PENDING' THEN ${CommissionsTable.commissionAmount} ELSE 0 END),0)`.mapWith(Number),
        paidEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status}='PAID' THEN ${CommissionsTable.commissionAmount} ELSE 0 END),0)`.mapWith(Number),
        totalSales: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(CommissionsTable)
      .where(and(...conds));

    // ---------- recent commissions (paginated) ----------
    const recent = await db
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
      .where(and(...conds))
      .orderBy(desc(CommissionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // ---------- total rows for pagination ----------
    const [{ total }] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(CommissionsTable)
      .where(and(...conds));

    return NextResponse.json(
      {
        stats,
        recentCommissions: recent,
        pagination: { page, limit, total: Number(total) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Earnings API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}