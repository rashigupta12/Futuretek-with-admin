// =====================================================
// 5. JYOTISHI - COUPON MANAGEMENT
// =====================================================

// app/api/jyotishi/coupons/route.ts
import { db } from "@/db";
import {
  CommissionsTable,
  CouponCoursesTable,
  CouponsTable,
  PaymentsTable,
  UserCouponsTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - List Jyotishi's coupons
export async function GET(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const conditions = [eq(CouponsTable.createdBy, jyotishiId)];
    
    if (isActive !== null) {
      conditions.push(eq(CouponsTable.isActive, isActive === "true"));
    }

    const coupons = await db
      .select()
      .from(CouponsTable)
      .where(and(...conditions))
      .orderBy(desc(CouponsTable.createdAt));

    // Get usage stats for each coupon
    const couponsWithStats = await Promise.all(
      coupons.map(async (coupon) => {
        const [stats] = await db
          .select({
            totalUsage: sql<number>`COUNT(*)`,
            totalRevenue: sql<number>`COALESCE(SUM(${PaymentsTable.finalAmount}), 0)`,
            totalCommission: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
          })
          .from(PaymentsTable)
          .leftJoin(
            CommissionsTable,
            eq(PaymentsTable.id, CommissionsTable.paymentId)
          )
          .where(
            and(
              eq(PaymentsTable.couponId, coupon.id),
              eq(PaymentsTable.status, "COMPLETED")
            )
          );

        return {
          ...coupon,
          stats,
        };
      })
    );

    return NextResponse.json({ coupons: couponsWithStats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create custom coupon
export async function POST(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const body = await req.json();
    const {
      code,
      type,
      discountType,
      discountValue,
      maxUsageCount,
      validFrom,
      validUntil,
      description,
      courseIds,
      userIds,
    } = body;

    // Validate required fields
    if (
      !code ||
      !type ||
      !discountType ||
      !discountValue ||
      !validFrom ||
      !validUntil
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const [existingCoupon] = await db
      .select()
      .from(CouponsTable)
      .where(eq(CouponsTable.code, code.toUpperCase()))
      .limit(1);

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create coupon
    const [coupon] = await db
      .insert(CouponsTable)
      .values({
        code: code.toUpperCase(),
        type,
        discountType,
        discountValue,
        maxUsageCount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        description,
        createdBy: jyotishiId,
      })
      .returning();

    // Link courses for COMBO type
    if (type === "COMBO" && courseIds && courseIds.length > 0) {
      await db.insert(CouponCoursesTable).values(
        courseIds.map((courseId: string) => ({
          couponId: coupon.id,
          courseId,
        }))
      );
    }

    // Link users for CUSTOM type
    if (type === "CUSTOM" && userIds && userIds.length > 0) {
      await db.insert(UserCouponsTable).values(
        userIds.map((userId: string) => ({
          couponId: coupon.id,
          userId,
        }))
      );
    }

    return NextResponse.json(
      { message: "Coupon created successfully", coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}