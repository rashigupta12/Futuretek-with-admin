/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-disable  @typescript-eslint/no-explicit-any*/

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  CouponsTable,
  CouponCoursesTable,
  UserCouponsTable,
  CouponType,
  DiscountType,
} from "@/db/schema";


type CouponTypeValue = "STANDARD" | "CUSTOM" | "COMBO";
type DiscountTypeValue = "PERCENTAGE" | "FIXED_AMOUNT";

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
       createdBy
    } = body;

    // Validate required fields
    if (!code || !type || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { error: "Unauthorized: Admin user not found" },
        { status: 401 }
      );
    }

    // Validate enum values
    const validTypes: CouponTypeValue[] = ["STANDARD", "CUSTOM", "COMBO"];
const validDiscountTypes: DiscountTypeValue[] = ["PERCENTAGE", "FIXED_AMOUNT"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
    }
    if (!validDiscountTypes.includes(discountType)) {
      return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
    }

    const [coupon] = await db
      .insert(CouponsTable)
      .values({
        code: code.toUpperCase(),
        type,
        discountType,
        discountValue: String(discountValue), // Drizzle expects string for decimal
        maxUsageCount: maxUsageCount ? Number(maxUsageCount) : undefined,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        description,
        createdBy, // This was missing!
      })
      .returning();

    // Link courses for COMBO type
    if (type === "COMBO" && Array.isArray(courseIds) && courseIds.length > 0) {
      await db.insert(CouponCoursesTable).values(
        courseIds.map((courseId: string) => ({
          couponId: coupon.id,
          courseId,
        }))
      );
    }

    // Link users for CUSTOM type
    if (type === "CUSTOM" && Array.isArray(userIds) && userIds.length > 0) {
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
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon", details: error.message },
      { status: 500 }
    );
  }
}