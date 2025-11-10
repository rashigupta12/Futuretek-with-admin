/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { CouponsTable, CoursesTable, PaymentsTable, UsersTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// ✅ Initialize Razorpay once at the top level
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST - Create payment order with commission calculation
export async function POST(req: NextRequest) {
  try {
    const { courseId, couponCode, paymentType, billingAddress } = await req.json();
    const userId = "user-id-from-session";

    // Get course
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Calculate amount
    const amount =
      paymentType === "FOREX"
        ? parseFloat(course.priceUSD)
        : parseFloat(course.priceINR);

    let gstAmount = 0;
    let discountAmount = 0;
    let couponId = null;
    let jyotishiId = null;
    let commissionAmount = 0;

    // Apply GST for domestic payments
    if (paymentType === "DOMESTIC") {
      gstAmount = amount * 0.18;
    }

    // Apply coupon if provided
    if (couponCode) {
      const [coupon] = await db
        .select({
          id: CouponsTable.id,
          discountType: CouponsTable.discountType,
          discountValue: CouponsTable.discountValue,
          jyotishiId: UsersTable.id,
          commissionRate: UsersTable.commissionRate,
        })
        .from(CouponsTable)
        .leftJoin(
          UsersTable,
          eq(CouponsTable.createdByJyotishiId, UsersTable.id)
        )
        .where(eq(CouponsTable.code, couponCode.toUpperCase()))
        .limit(1);

      if (coupon && coupon.id) {
        // Validate coupon logic
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (amount * parseFloat(coupon.discountValue)) / 100;
        } else {
          discountAmount = parseFloat(coupon.discountValue);
        }
        couponId = coupon.id;
        jyotishiId = coupon.jyotishiId;

        // Calculate commission on final amount (after discount + GST)
        const finalAmount = amount - discountAmount + gstAmount;
        if (coupon.commissionRate) {
          commissionAmount =
            (finalAmount * parseFloat(coupon.commissionRate)) / 100;
        }
      }
    }

    const finalAmount = amount + gstAmount - discountAmount;

    // Generate invoice number
    const year = new Date().getFullYear().toString().slice(-2);
    const nextYear = (parseInt(year) + 1).toString();
    const financialYear = `${year}${nextYear}`;
    const invoiceType = paymentType === "FOREX" ? "F" : "G";

    // Get last invoice number
    const [lastPayment] = await db
      .select({ invoiceNumber: PaymentsTable.invoiceNumber })
      .from(PaymentsTable)
      .where(eq(PaymentsTable.paymentType, paymentType))
      .orderBy(desc(PaymentsTable.createdAt))
      .limit(1);

    let invoiceCounter = 1;
    if (lastPayment) {
      const lastCounter = parseInt(lastPayment.invoiceNumber.slice(-5));
      invoiceCounter = lastCounter + 1;
    }

    const invoiceNumber = `FT${financialYear}${invoiceType}${String(
      invoiceCounter
    ).padStart(5, "0")}`;

    // ✅ Create Razorpay order (no require() used)
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: paymentType === "FOREX" ? "USD" : "INR",
      receipt: invoiceNumber,
    });

    // Create payment record
    const [payment] = await db
      .insert(PaymentsTable)
      .values({
        userId,
        invoiceNumber,
        paymentType,
        amount: amount.toString(),
        currency: paymentType === "FOREX" ? "USD" : "INR",
        gstAmount: gstAmount.toString(),
        discountAmount: discountAmount.toString(),
        finalAmount: finalAmount.toString(),
        couponId,
        jyotishiId,
        commissionAmount: commissionAmount.toString(),
        razorpayOrderId: order.id,
        status: "PENDING",
        billingAddress,
      })
      .returning();

    return NextResponse.json(
      {
        orderId: order.id,
        amount: finalAmount,
        currency: paymentType === "FOREX" ? "USD" : "INR",
        invoiceNumber,
        paymentId: payment.id,
        commission: commissionAmount > 0 ? commissionAmount : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
