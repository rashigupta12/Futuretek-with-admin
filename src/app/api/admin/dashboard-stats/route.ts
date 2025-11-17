// src/app/api/admin/dashboard-stats/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import {
  CertificateRequestsTable,
  CoursesTable,
  EnrollmentsTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Users (with month-over-month growth)
    const [totalUsers] = await db
      .select({ count: count() })
      .from(UsersTable);

    const [lastMonthUsers] = await db
      .select({ count: count() })
      .from(UsersTable)
      .where(
        and(
          gte(UsersTable.createdAt, firstDayLastMonth),
          sql`${UsersTable.createdAt} < ${firstDayThisMonth}`
        )
      );

    const [thisMonthUsers] = await db
      .select({ count: count() })
      .from(UsersTable)
      .where(gte(UsersTable.createdAt, firstDayThisMonth));

    const userGrowth = lastMonthUsers.count > 0 
      ? ((thisMonthUsers.count - lastMonthUsers.count) / lastMonthUsers.count) * 100 
      : thisMonthUsers.count > 0 ? 100 : 0;

    // 2. Active Courses (REGISTRATION_OPEN, ONGOING)
    const [activeCourses] = await db
      .select({ count: count() })
      .from(CoursesTable)
      .where(
        sql`${CoursesTable.status} IN ('REGISTRATION_OPEN', 'ONGOING')`
      );

    const [totalCourses] = await db
      .select({ count: count() })
      .from(CoursesTable);

    const [newCoursesThisMonth] = await db
      .select({ count: count() })
      .from(CoursesTable)
      .where(gte(CoursesTable.createdAt, firstDayThisMonth));

    // 3. Total Revenue (with month-over-month comparison)
    const [totalRevenueResult] = await db
      .select({ 
        total: sum(PaymentsTable.finalAmount) 
      })
      .from(PaymentsTable)
      .where(eq(PaymentsTable.status, "COMPLETED"));

    const [lastMonthRevenue] = await db
      .select({ 
        total: sum(PaymentsTable.finalAmount) 
      })
      .from(PaymentsTable)
      .where(
        and(
          eq(PaymentsTable.status, "COMPLETED"),
          gte(PaymentsTable.createdAt, firstDayLastMonth),
          sql`${PaymentsTable.createdAt} < ${firstDayThisMonth}`
        )
      );

    const [thisMonthRevenue] = await db
      .select({ 
        total: sum(PaymentsTable.finalAmount) 
      })
      .from(PaymentsTable)
      .where(
        and(
          eq(PaymentsTable.status, "COMPLETED"),
          gte(PaymentsTable.createdAt, firstDayThisMonth)
        )
      );

    const totalRevenue = parseFloat(totalRevenueResult?.total || "0");
    const lastMonthRev = parseFloat(lastMonthRevenue?.total || "0");
    const thisMonthRev = parseFloat(thisMonthRevenue?.total || "0");
    
    const revenueGrowth = lastMonthRev > 0 
      ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 
      : thisMonthRev > 0 ? 100 : 0;

    // 4. Pending Certificate Requests
    const [pendingCertificates] = await db
      .select({ count: count() })
      .from(CertificateRequestsTable)
      .where(eq(CertificateRequestsTable.status, "PENDING"));

    // 5. Additional Stats
    const [totalEnrollments] = await db
      .select({ count: count() })
      .from(EnrollmentsTable);

    const [activeEnrollments] = await db
      .select({ count: count() })
      .from(EnrollmentsTable)
      .where(eq(EnrollmentsTable.status, "ACTIVE"));

    return NextResponse.json({
      totalUsers: {
        count: totalUsers.count || 0,
        growth: Math.round(userGrowth * 10) / 10, // Round to 1 decimal
        newThisMonth: thisMonthUsers.count || 0
      },
      activeCourses: {
        count: activeCourses.count || 0,
        total: totalCourses.count || 0,
        newThisMonth: newCoursesThisMonth.count || 0
      },
      revenue: {
        total: totalRevenue,
        growth: Math.round(revenueGrowth * 10) / 10,
        thisMonth: thisMonthRev
      },
      pendingCertificates: {
        count: pendingCertificates.count || 0
      },
      enrollments: {
        total: totalEnrollments.count || 0,
        active: activeEnrollments.count || 0
      }
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}