/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payment/create-order/route.ts
import { db } from "@/db";
import { 
  CouponsTable, 
  CoursesTable, 
  PaymentsTable, 
  UsersTable,
} from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from '@/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { courseId, couponCode, paymentType = "DOMESTIC", billingAddress } = await req.json();
    
    const session = await auth()
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }

    // Validate paymentType
    if (!paymentType || !["DOMESTIC", "FOREX"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Invalid payment type. Must be DOMESTIC or FOREX" },
        { status: 400 }
      );
    }

    // ✅ Get course WITH commission rate
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // ✅ Get course commission rate from database
    const courseCommissionRate = parseFloat(course.commissionPercourse || "0");
    
    console.log('Course commission rate:', {
      courseId: course.id,
      courseTitle: course.title,
      commissionPercourse: course.commissionPercourse,
      commissionRate: courseCommissionRate
    });

    // Calculate base amount based on payment type
    const baseAmount = paymentType === "FOREX" 
      ? parseFloat(course.priceUSD || "0") 
      : parseFloat(course.priceINR);

    if (isNaN(baseAmount) || baseAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid course price" },
        { status: 400 }
      );
    }

    // Initialize pricing variables
    const originalPrice = baseAmount;
    let subtotal = baseAmount;
    let gstAmount = 0;
    let finalAmount = baseAmount;
    let totalDiscountAmount = 0;
    let adminDiscountAmount = 0;
    let jyotishiDiscountAmount = 0;
    let priceAfterAdminDiscount = baseAmount;
    let commissionAmount = 0;
    const appliedCoupons: any[] = [];
    const couponIds: string[] = [];
    let jyotishiId: string | null = null;

    // ✅ HANDLE MULTIPLE COUPONS (comma-separated)
    if (couponCode && couponCode.trim()) {
      // Split by comma and trim whitespace
      const couponCodes = couponCode.split(',').map((code: string) => code.trim().toUpperCase());
      
      console.log('Processing coupon codes:', couponCodes);

      // Fetch all coupons in one query
      const coupons = await db
        .select({
          id: CouponsTable.id,
          code: CouponsTable.code,
          discountType: CouponsTable.discountType,
          discountValue: CouponsTable.discountValue,
          createdByJyotishiId: CouponsTable.createdByJyotishiId,
          jyotishiRole: UsersTable.role,
          jyotishiName: UsersTable.name,
        })
        .from(CouponsTable)
        .leftJoin(
          UsersTable,
          eq(CouponsTable.createdByJyotishiId, UsersTable.id)
        )
        .where(inArray(CouponsTable.code, couponCodes));

      if (coupons.length === 0) {
        return NextResponse.json(
          { error: "No valid coupons found" },
          { status: 400 }
        );
      }

      console.log('Found coupons:', coupons.map(c => ({ code: c.code, type: c.jyotishiRole })));

      // Sort coupons: ADMIN coupons first, then JYOTISHI coupons
      const sortedCoupons = coupons.sort((a, b) => {
        if (a.jyotishiRole === 'ADMIN' && b.jyotishiRole !== 'ADMIN') return -1;
        if (a.jyotishiRole !== 'ADMIN' && b.jyotishiRole === 'ADMIN') return 1;
        return 0;
      });

      // Apply each coupon sequentially
      for (const coupon of sortedCoupons) {
        let discountAmount = 0;
        let baseForDiscount = originalPrice;

        // Determine the base price for this discount
        if (coupon.jyotishiRole === 'JYOTISHI') {
          // Jyotishi discount applies to price after admin discount
          baseForDiscount = priceAfterAdminDiscount;
        }

        // Calculate discount
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (baseForDiscount * parseFloat(coupon.discountValue)) / 100;
        } else {
          discountAmount = parseFloat(coupon.discountValue);
        }

        // Ensure discount doesn't exceed base amount
        discountAmount = Math.min(discountAmount, baseForDiscount);

        console.log(`Applied coupon ${coupon.code}:`, {
          type: coupon.jyotishiRole,
          baseForDiscount,
          discountAmount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        });

        // Track discount amounts by creator type
        if (coupon.jyotishiRole === "JYOTISHI") {
          jyotishiDiscountAmount += discountAmount;
          jyotishiId = coupon.createdByJyotishiId;

          // ✅ FIXED: Calculate commission using course commission rate from DB
          // Commission is calculated on price AFTER admin discount, BEFORE jyotishi discount
          if (courseCommissionRate > 0) {
            commissionAmount = (priceAfterAdminDiscount * courseCommissionRate) / 100;
            
            console.log('💰 Commission calculation:', {
              priceAfterAdminDiscount,
              courseCommissionRate: `${courseCommissionRate}%`,
              commissionAmount,
              jyotishiId
            });
          }
        } else {
          adminDiscountAmount += discountAmount;
          priceAfterAdminDiscount = originalPrice - adminDiscountAmount;
        }

        totalDiscountAmount += discountAmount;
        couponIds.push(coupon.id);

        // Store coupon details
        appliedCoupons.push({
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: Math.round(discountAmount),
          creatorType: coupon.jyotishiRole === "JYOTISHI" ? "JYOTISHI" : "ADMIN",
          creatorName: coupon.jyotishiName
        });
      }

      // Calculate final subtotal after all discounts
      subtotal = originalPrice - totalDiscountAmount;

      console.log('Final pricing breakdown:', {
        originalPrice,
        adminDiscountAmount,
        priceAfterAdminDiscount,
        jyotishiDiscountAmount,
        totalDiscountAmount,
        subtotal,
        commissionAmount,
        commissionRate: `${courseCommissionRate}%`
      });
    }

    // Apply GST for domestic payments (ONLY on discounted subtotal)
    if (paymentType === "DOMESTIC") {
      gstAmount = subtotal * 0.18;
      finalAmount = subtotal + gstAmount;
    } else {
      finalAmount = subtotal;
    }

    // Ensure final amount is not negative
    if (finalAmount < 0) {
      finalAmount = 0;
    }

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
    if (lastPayment?.invoiceNumber) {
      const lastCounter = parseInt(lastPayment.invoiceNumber.slice(-5));
      invoiceCounter = isNaN(lastCounter) ? 1 : lastCounter + 1;
    }

    const invoiceNumber = `FT${financialYear}${invoiceType}${String(
      invoiceCounter
    ).padStart(5, "0")}`;

    // Create Razorpay order with the CORRECT discounted amount
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: paymentType === "FOREX" ? "USD" : "INR",
      receipt: invoiceNumber,
      notes: {
        courseId,
        userId,
        coupons: couponCode || '',
        original_price: originalPrice.toString(),
        admin_discount: adminDiscountAmount.toString(),
        jyotishi_discount: jyotishiDiscountAmount.toString(),
        total_discount: totalDiscountAmount.toString(),
        subtotal: subtotal.toString(),
        gst: gstAmount.toString(),
        commission: commissionAmount.toString(),
        commission_rate: courseCommissionRate.toString()
      }
    });

    // Create payment record
    const [payment] = await db
      .insert(PaymentsTable)
      .values({
        userId,
        invoiceNumber,
        paymentType,
        amount: originalPrice.toString(),
        currency: paymentType === "FOREX" ? "USD" : "INR",
        gstAmount: gstAmount.toString(),
        discountAmount: totalDiscountAmount.toString(),
        finalAmount: finalAmount.toString(),
        couponId: couponIds.length > 0 ? couponIds[0] : null,
        jyotishiId: jyotishiId,
        commissionAmount: commissionAmount.toString(),
        razorpayOrderId: order.id,
        status: "PENDING",
        billingAddress: billingAddress || null,
      })
      .returning();

    console.log('Payment created:', {
      paymentId: payment.id,
      finalAmount,
      commissionAmount,
      commissionRate: `${courseCommissionRate}%`,
      appliedCoupons: appliedCoupons.map(c => c.code)
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: finalAmount,
        currency: paymentType === "FOREX" ? "USD" : "INR",
        invoiceNumber,
        paymentId: payment.id,
        commission: commissionAmount > 0 ? commissionAmount : null,
        commissionRate: courseCommissionRate,
        discount: totalDiscountAmount,
        adminDiscount: adminDiscountAmount,
        jyotishiDiscount: jyotishiDiscountAmount,
        priceAfterAdminDiscount,
        subtotal: subtotal,
        gstAmount: gstAmount,
        appliedCoupons
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