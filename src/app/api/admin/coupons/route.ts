/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CouponsTable, CouponCoursesTable, UserCouponsTable } from "@/db/schema";

// GET - List all coupons
export async function GET(req: NextRequest) {
  try {
    const coupons = await db.select().from(CouponsTable);
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create coupon
export async function POST(req: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
