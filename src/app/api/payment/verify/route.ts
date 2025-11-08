/*eslint-disable  @typescript-eslint/no-require-imports*/
// app/api/payment/verify/route.ts
import { db } from "@/db";
import { CoursesTable, EnrollmentsTable, PaymentsTable } from "@/db/schema";
import { createCommissionRecord } from "@/lib/helper";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



export async function verifyPaymentWithCommission(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      courseId,
    } = await req.json();

    const userId = "user-id-from-session";

    // Verify signature (existing code)
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

    // Create commission record if coupon was used by Jyotishi
    if (payment.couponId) {
      await createCommissionRecord(
        paymentId,
        courseId,
        userId,
        payment.couponId,
        parseFloat(payment.finalAmount)
      );
    }

    return NextResponse.json(
      {
        message: "Payment verified successfully",
        enrollment,
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
