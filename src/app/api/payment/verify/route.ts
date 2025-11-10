/* eslint-disable  @typescript-eslint/no-require-imports */
// app/api/payment/verify/route.ts
import { db } from "@/db";
import { CommissionsTable, CouponsTable, CoursesTable, EnrollmentsTable, PaymentsTable, UsersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      courseId,
    } = await req.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay key secret not configured');
  return NextResponse.json(
    { error: "Payment gateway configuration error" },
    { status: 500 }
  );
}

const session = await auth()
const userId = session?.user?.id

if (!userId) {
  return NextResponse.json(
    { error: "Unauthorized: User not logged in" },
    { status: 401 }
  );
}
    // Verify signature
    const crypto = require("crypto");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment details
    const [payment] = await db
      .select()
      .from(PaymentsTable)
      .where(eq(PaymentsTable.id, paymentId))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status
    await db
      .update(PaymentsTable)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(PaymentsTable.id, paymentId));

    // Create enrollment
    const [enrollment] = await db
      .insert(EnrollmentsTable)
      .values({
        userId,
        courseId,
        status: "ACTIVE",
      })
      .returning();

    // Update enrollment in payment
    await db
      .update(PaymentsTable)
      .set({ enrollmentId: enrollment.id })
      .where(eq(PaymentsTable.id, paymentId));

    // Update course enrollment count
    await db.execute(
      sql`UPDATE ${CoursesTable} SET current_enrollments = current_enrollments + 1 WHERE id = ${courseId}`
    );

    // Update coupon usage count
    if (payment.couponId) {
      await db.execute(
        sql`UPDATE ${CouponsTable} SET current_usage_count = current_usage_count + 1 WHERE id = ${payment.couponId}`
      );

      // Create commission record if Jyotishi coupon was used
      if (payment.jyotishiId && parseFloat(payment.commissionAmount) > 0) {
        // Get Jyotishi commission rate
        const [jyotishi] = await db
          .select({ commissionRate: UsersTable.commissionRate })
          .from(UsersTable)
          .where(eq(UsersTable.id, payment.jyotishiId))
          .limit(1);

        await db.insert(CommissionsTable).values({
          jyotishiId: payment.jyotishiId,
          paymentId: payment.id,
          courseId,
          studentId: userId,
          couponId: payment.couponId,
          commissionRate: jyotishi?.commissionRate || "0",
          saleAmount: payment.finalAmount,
          commissionAmount: payment.commissionAmount,
          status: "PENDING",
        });
      }
    }

  return NextResponse.json(
  {
    success: true,
    message: "Payment verified successfully",
    enrollment,
    paymentId: payment.id
  },
  { status: 200 }
);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

