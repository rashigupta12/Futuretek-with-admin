// src/app/api/agent/dashboard-stats/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  PayoutsTable,
  UsersTable
} from "@/db/schema";
import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "JYOTISHI") {
      return NextResponse.json(
        { error: "Unauthorized - Agent access required" },
        { status: 401 }
      );
    }

    const jyotishiId = session.user.id;

    // Calculate date ranges
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Active Coupons
    const [activeCoupons] = await db
      .select({ count: count() })
      .from(CouponsTable)
      .where(
        and(
          eq(CouponsTable.createdByJyotishiId, jyotishiId),
          eq(CouponsTable.isActive, true),
          sql`${CouponsTable.validUntil} > NOW()`
        )
      );

    const [totalCoupons] = await db
      .select({ count: count() })
      .from(CouponsTable)
      .where(eq(CouponsTable.createdByJyotishiId, jyotishiId));

    // 2. Total Earnings (All time commissions)
    const [totalEarnings] = await db
      .select({ 
        total: sum(CommissionsTable.commissionAmount),
        count: count()
      })
      .from(CommissionsTable)
      .where(eq(CommissionsTable.jyotishiId, jyotishiId));

    const totalEarningsAmount = parseFloat(totalEarnings?.total || "0");
    const totalSales = totalEarnings?.count || 0;

    // 3. This Month Earnings
    const [thisMonthEarnings] = await db
      .select({ 
        total: sum(CommissionsTable.commissionAmount),
        count: count()
      })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          gte(CommissionsTable.createdAt, firstDayThisMonth)
        )
      );

    const thisMonthAmount = parseFloat(thisMonthEarnings?.total || "0");
    const thisMonthSales = thisMonthEarnings?.count || 0;

    // 4. Last Month Earnings (for growth calculation)
    const [lastMonthEarnings] = await db
      .select({ 
        total: sum(CommissionsTable.commissionAmount)
      })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          gte(CommissionsTable.createdAt, firstDayLastMonth),
          sql`${CommissionsTable.createdAt} < ${firstDayThisMonth}`
        )
      );

    const lastMonthAmount = parseFloat(lastMonthEarnings?.total || "0");
    const earningsGrowth = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 
      : thisMonthAmount > 0 ? 100 : 0;

    // 5. Pending Commissions (Not yet paid out)
    const [pendingCommissions] = await db
      .select({ 
        total: sum(CommissionsTable.commissionAmount),
        count: count()
      })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          eq(CommissionsTable.status, "PENDING")
        )
      );

    const pendingAmount = parseFloat(pendingCommissions?.total || "0");
    const pendingCount = pendingCommissions?.count || 0;

    // 6. Paid Commissions
    const [paidCommissions] = await db
      .select({ 
        total: sum(CommissionsTable.commissionAmount)
      })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          eq(CommissionsTable.status, "PAID")
        )
      );

    const paidAmount = parseFloat(paidCommissions?.total || "0");

    // 7. Recent Payouts
    const [completedPayouts] = await db
      .select({ 
        total: sum(PayoutsTable.amount),
        count: count()
      })
      .from(PayoutsTable)
      .where(
        and(
          eq(PayoutsTable.jyotishiId, jyotishiId),
          eq(PayoutsTable.status, "COMPLETED")
        )
      );

    const totalPayouts = parseFloat(completedPayouts?.total || "0");
    const payoutCount = completedPayouts?.count || 0;

    // 8. Get agent's commission rate
    const [agentInfo] = await db
      .select({ 
        commissionRate: UsersTable.commissionRate,
        jyotishiCode: UsersTable.jyotishiCode
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, jyotishiId));

    const commissionRate = parseFloat(agentInfo?.commissionRate || "0");

    // 9. Coupon Usage Stats (this month)
    const [couponUsage] = await db
      .select({ count: count() })
      .from(CommissionsTable)
      .where(
        and(
          eq(CommissionsTable.jyotishiId, jyotishiId),
          gte(CommissionsTable.createdAt, firstDayThisMonth)
        )
      );

    return NextResponse.json({
      coupons: {
        active: activeCoupons.count || 0,
        total: totalCoupons.count || 0,
        usedThisMonth: couponUsage.count || 0
      },
      earnings: {
        total: totalEarningsAmount,
        thisMonth: thisMonthAmount,
        growth: Math.round(earningsGrowth * 10) / 10,
        totalSales: totalSales
      },
      commissions: {
        pending: {
          amount: pendingAmount,
          count: pendingCount
        },
        paid: {
          amount: paidAmount
        }
      },
      payouts: {
        total: totalPayouts,
        count: payoutCount
      },
      agent: {
        commissionRate: commissionRate,
        code: agentInfo?.jyotishiCode || "N/A"
      },
      performance: {
        thisMonthSales: thisMonthSales,
        avgCommissionPerSale: thisMonthSales > 0 ? thisMonthAmount / thisMonthSales : 0
      }
    });
  } catch (error) {
    console.error("Agent dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}