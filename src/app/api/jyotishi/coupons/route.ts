/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from "@/db";
import {
  CommissionsTable,
  CouponCoursesTable,
  CouponsTable,
  CouponTypesTable,
  PaymentsTable,
  UsersTable,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // ✅ your /src/auth.ts file

// =====================================================
// 5. JYOTISHI - COUPON MANAGEMENT
// =====================================================

// GET - List Jyotishi's coupons
export async function GET(req: NextRequest) {
  try {
    // ✅ Get the authenticated user (server-side)
    const session = await auth();
    const jyotishiId = session?.user?.id;
    const role = session?.user?.role;

    if (!jyotishiId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    // ✅ Build condition based on role (admin sees all, jyotishi sees own)
    const conditions = [];
    if (role === "JYOTISHI") {
      conditions.push(eq(CouponsTable.createdByJyotishiId, jyotishiId));
    }

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
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(CouponsTable.createdAt));

    // Get usage + commission stats
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

        return { ...coupon, stats };
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
    const session = await auth();
    const jyotishiId = session?.user?.id;
    const role = session?.user?.role;

    if (!jyotishiId || role !== "JYOTISHI") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!couponTypeId || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [jyotishi] = await db
      .select({
        jyotishiCode: UsersTable.jyotishiCode,
        commissionRate: UsersTable.commissionRate,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, jyotishiId))
      .limit(1);

    if (!jyotishi?.jyotishiCode) {
      return NextResponse.json(
        { error: "Jyotishi code not found" },
        { status: 404 }
      );
    }

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

    const formattedDiscount = discountValue.toString().replace(".", "");
    const couponCode = `COUP${jyotishi.jyotishiCode}${couponType.typeCode}${formattedDiscount}`;

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

    if (courseIds?.length > 0) {
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
