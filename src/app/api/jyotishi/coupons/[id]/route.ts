/*eslint-disable @typescript-eslint/no-explicit-any*/
// app/api/jyotishi/coupons/[id]/route.ts
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  CoursesTable,
  EnrollmentsTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// GET - Get coupon details
export async function GET(
  req: NextRequest,
    context: { params: Promise<{ id: string }> } 
) {
   const params = await context.params; 
  try {
    const jyotishiId = "jyotishi-id-from-session";

    const [coupon] = await db
      .select()
      .from(CouponsTable)
      .where(
        and(
          eq(CouponsTable.id, params.id),
          eq(CouponsTable.createdBy, jyotishiId)
        )
      )
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Get usage details
    const usageDetails = await db
      .select({
        id: PaymentsTable.id,
        invoiceNumber: PaymentsTable.invoiceNumber,
        amount: PaymentsTable.finalAmount,
        commission: CommissionsTable.commissionAmount,
        studentName: UsersTable.name,
        courseName: CoursesTable.title,
        createdAt: PaymentsTable.createdAt,
      })
      .from(PaymentsTable)
      .leftJoin(UsersTable, eq(PaymentsTable.userId, UsersTable.id))
      .leftJoin(
        EnrollmentsTable,
        eq(PaymentsTable.enrollmentId, EnrollmentsTable.id)
      )
      .leftJoin(CoursesTable, eq(EnrollmentsTable.courseId, CoursesTable.id))
      .leftJoin(
        CommissionsTable,
        eq(PaymentsTable.id, CommissionsTable.paymentId)
      )
      .where(
        and(
          eq(PaymentsTable.couponId, params.id),
          eq(PaymentsTable.status, "COMPLETED")
        )
      )
      .orderBy(desc(PaymentsTable.createdAt));

    return NextResponse.json(
      {
        coupon,
        usageDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon details" },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(
  req: NextRequest,
   context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params; 
  try {
    const jyotishiId = "jyotishi-id-from-session";
    const body = await req.json();
    const { isActive, validUntil, maxUsageCount, description } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (isActive !== undefined) updateData.isActive = isActive;
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (maxUsageCount !== undefined) updateData.maxUsageCount = maxUsageCount;
    if (description !== undefined) updateData.description = description;

    const [updatedCoupon] = await db
      .update(CouponsTable)
      .set(updateData)
      .where(
        and(
          eq(CouponsTable.id, params.id),
          eq(CouponsTable.createdBy, jyotishiId)
        )
      )
      .returning();

    if (!updatedCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Coupon updated successfully", coupon: updatedCoupon },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate coupon
export async function DELETE(
  req: NextRequest,
    context: { params: Promise<{ id: string }> } 
) {
   const params = await context.params; 
  try {
    const jyotishiId = "jyotishi-id-from-session";

    const [coupon] = await db
      .update(CouponsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(CouponsTable.id, params.id),
          eq(CouponsTable.createdBy, jyotishiId)
        )
      )
      .returning();

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Coupon deactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to deactivate coupon" },
      { status: 500 }
    );
  }
}