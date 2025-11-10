/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import {
  CouponCoursesTable,
  CouponTypesTable,
  CouponsTable,
  UserCouponsTable,
  UsersTable
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// app/api/coupons/validate/route.ts
// POST - Validate coupon code
export async function POST(req: NextRequest) {
  try {
    const { code, courseId, userId } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Get coupon with type and jyotishi details
    const [coupon] = await db
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
        description: CouponsTable.description,
        typeName: CouponTypesTable.typeName,
        jyotishiId: UsersTable.id,
        jyotishiName: UsersTable.name,
        jyotishiCode: UsersTable.jyotishiCode,
        commissionRate: UsersTable.commissionRate,
      })
      .from(CouponsTable)
      .leftJoin(
        CouponTypesTable,
        eq(CouponsTable.couponTypeId, CouponTypesTable.id)
      )
      .leftJoin(
        UsersTable,
        eq(CouponsTable.createdByJyotishiId, UsersTable.id)
      )
      .where(eq(CouponsTable.code, code.toUpperCase()))
      .limit(1);

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { error: "This coupon has expired or is not yet valid" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (
      coupon.maxUsageCount &&
      coupon.currentUsageCount >= coupon.maxUsageCount
    ) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check if coupon is for specific courses
    if (courseId) {
      const [courseMapping] = await db
        .select()
        .from(CouponCoursesTable)
        .where(
          and(
            eq(CouponCoursesTable.couponId, coupon.id),
            eq(CouponCoursesTable.courseId, courseId)
          )
        )
        .limit(1);

      // If coupon has course restrictions but this course is not in the list
      const [hasRestrictions] = await db
        .select()
        .from(CouponCoursesTable)
        .where(eq(CouponCoursesTable.couponId, coupon.id))
        .limit(1);

      if (hasRestrictions && !courseMapping) {
        return NextResponse.json(
          { error: "This coupon is not valid for the selected course" },
          { status: 400 }
        );
      }
    }

    // Check if user-specific coupon
    if (userId) {
      const [userCoupon] = await db
        .select()
        .from(UserCouponsTable)
        .where(
          and(
            eq(UserCouponsTable.couponId, coupon.id),
            eq(UserCouponsTable.userId, userId)
          )
        )
        .limit(1);

      // If user-specific coupons exist, check if this user is assigned
      const [hasUserRestrictions] = await db
        .select()
        .from(UserCouponsTable)
        .where(eq(UserCouponsTable.couponId, coupon.id))
        .limit(1);

      if (hasUserRestrictions && !userCoupon) {
        return NextResponse.json(
          { error: "This coupon is not assigned to you" },
          { status: 400 }
        );
      }

      if (userCoupon && userCoupon.isUsed) {
        return NextResponse.json(
          { error: "You have already used this coupon" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description,
          typeName: coupon.typeName,
          jyotishiName: coupon.jyotishiName,
          jyotishiCode: coupon.jyotishiCode,
        },
        commission: {
          jyotishiId: coupon.jyotishiId,
          commissionRate: coupon.commissionRate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
