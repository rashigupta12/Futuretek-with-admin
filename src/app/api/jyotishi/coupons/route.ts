// =====================================================
// 5. JYOTISHI - COUPON MANAGEMENT
// =====================================================

// app/api/jyotishi/coupons/route.ts
import { db } from "@/db";
import {
  CommissionsTable,
  CouponCoursesTable,
  CouponsTable,
  CouponTypesTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// app/api/jyotishi/coupons/route.ts
// GET - List Jyotishi's coupons
export async function GET(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const conditions = [eq(CouponsTable.createdByJyotishiId, jyotishiId)];

    if (isActive !== null) {
      conditions.push(eq(CouponsTable.isActive, isActive === "true"));
    }

    const coupons = await db
      .select({
        id: CouponsTable.id,
        code: CouponsTable.code,
        discountType: CouponsTable.discountType,
        discountValue: CouponsTable.discountValue,
        maxUsageCount: CouponsTable.maxUsageCount,
        currentUsageCount: CouponsTable.currentUsageCount,
        validFrom: CouponsTable.validFrom,
        validUntil: CouponsTable.validUntil,
        isActive: CouponsTable.isActive,
        createdAt: CouponsTable.createdAt,
        typeName: CouponTypesTable.typeName,
        typeCode: CouponTypesTable.typeCode,
      })
      .from(CouponsTable)
      .leftJoin(
        CouponTypesTable,
        eq(CouponsTable.couponTypeId, CouponTypesTable.id)
      )
      .where(and(...conditions))
      .orderBy(desc(CouponsTable.createdAt));

    // Get usage and commission stats for each coupon
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

// POST - Create coupon with type selection
export async function POST(req: NextRequest) {
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const body = await req.json();
    const {
      couponTypeId,
      discountValue,
      maxUsageCount,
      validFrom,
      validUntil,
      description,
      courseIds,
    } = body;

    // Validate required fields
    if (!couponTypeId || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get Jyotishi details
    const [jyotishi] = await db
      .select({
        jyotishiCode: UsersTable.jyotishiCode,
        commissionRate: UsersTable.commissionRate,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, jyotishiId))
      .limit(1);

    if (!jyotishi || !jyotishi.jyotishiCode) {
      return NextResponse.json(
        { error: "Jyotishi code not found" },
        { status: 404 }
      );
    }

    // Get coupon type
    const [couponType] = await db
      .select()
      .from(CouponTypesTable)
      .where(
        and(
          eq(CouponTypesTable.id, couponTypeId),
          eq(CouponTypesTable.isActive, true)
        )
      )
      .limit(1);

    if (!couponType) {
      return NextResponse.json(
        { error: "Coupon type not found or inactive" },
        { status: 404 }
      );
    }

    // Validate discount value against max limit
    if (
      couponType.maxDiscountLimit &&
      parseFloat(discountValue) > parseFloat(couponType.maxDiscountLimit)
    ) {
      return NextResponse.json(
        {
          error: `Discount value exceeds maximum limit of ${couponType.maxDiscountLimit}`,
        },
        { status: 400 }
      );
    }

    // Generate coupon code: COUP[JyotishiCode][TypeCode][DiscountValue]
    const formattedDiscount = discountValue.toString().replace(".", "");
    const couponCode = `COUP${jyotishi.jyotishiCode}${couponType.typeCode}${formattedDiscount}`;

    // Check if code already exists
    const [existingCoupon] = await db
      .select()
      .from(CouponsTable)
      .where(eq(CouponsTable.code, couponCode))
      .limit(1);

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists. Try a different discount value." },
        { status: 400 }
      );
    }

    // Create coupon
    const [coupon] = await db
      .insert(CouponsTable)
      .values({
        code: couponCode,
        couponTypeId,
        createdByJyotishiId: jyotishiId,
        discountType: couponType.discountType,
        discountValue,
        maxUsageCount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        description,
      })
      .returning();

    // Link courses if provided
    if (courseIds && courseIds.length > 0) {
      await db.insert(CouponCoursesTable).values(
        courseIds.map((courseId: string) => ({
          couponId: coupon.id,
          courseId,
        }))
      );
    }

    return NextResponse.json(
      {
        message: "Coupon created successfully",
        coupon: {
          ...coupon,
          typeName: couponType.typeName,
          jyotishiCode: jyotishi.jyotishiCode,
        },
      },
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
