/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { CouponCoursesTable, CouponsTable, UserCouponsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// app/api/coupons/validate/route.ts
export async function POST(req: NextRequest) {
  try {
    const { code, courseId, userId } = await req.json();

    const [coupon] = await db
      .select()
      .from(CouponsTable)
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
        { error: "Coupon is not active" },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (
      coupon.maxUsageCount &&
      (coupon.currentUsageCount ?? 0) >= coupon.maxUsageCount
    ) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Check if coupon is for specific courses (COMBO type)
    if (coupon.type === "COMBO") {
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

      if (!courseMapping) {
        return NextResponse.json(
          { error: "Coupon not valid for this course" },
          { status: 400 }
        );
      }
    }

    // Check if coupon is user-specific (CUSTOM type)
    if (coupon.type === "CUSTOM") {
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

      if (!userCoupon) {
        return NextResponse.json(
          { error: "This coupon is not assigned to you" },
          { status: 400 }
        );
      }

      if (userCoupon.isUsed) {
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
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
