// app/api/payment/verify/route.ts
import { db } from "@/db";
import { CoursesTable, EnrollmentsTable, PaymentsTable } from "@/db/schema";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      courseId,
    } = await req.json();

    const userId = "user-id-from-session";

    // Verify signature
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
    await db
      .update(CoursesTable)
      .set({
        currentEnrollments: sql`current_enrollments + 1`,
      })
      .where(eq(CoursesTable.id, courseId));

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