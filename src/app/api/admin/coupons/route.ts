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
  CouponTypesTable,
  UsersTable,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";


type CouponTypeValue = "STANDARD" | "CUSTOM" | "COMBO";
type DiscountTypeValue = "PERCENTAGE" | "FIXED_AMOUNT";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jyotishiId = searchParams.get("jyotishiId");
    const typeId = searchParams.get("typeId");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (jyotishiId) {
      conditions.push(eq(CouponsTable.createdByJyotishiId, jyotishiId));
    }
    if (typeId) {
      conditions.push(eq(CouponsTable.couponTypeId, typeId));
    }
    if (isActive !== null) {
      conditions.push(eq(CouponsTable.isActive, isActive === "true"));
    }

    const coupons = await db
      .select({
        id: CouponsTable.id,
        code: CouponsTable.code,
        discountValue: CouponsTable.discountValue,
        discountType: CouponsTable.discountType,
        currentUsageCount: CouponsTable.currentUsageCount,
        maxUsageCount: CouponsTable.maxUsageCount,
        isActive: CouponsTable.isActive,
        validUntil: CouponsTable.validUntil,
        createdAt: CouponsTable.createdAt,
        typeName: CouponTypesTable.typeName,
        typeCode: CouponTypesTable.typeCode,
        jyotishiName: UsersTable.name,
        jyotishiCode: UsersTable.jyotishiCode,
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(CouponsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(CouponsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json(
      {
        coupons,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}