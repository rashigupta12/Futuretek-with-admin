/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  X,
  Users,
  Crown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// Razorpay type declarations
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  notes?: Record<string, string>;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface Course {
  id: string;
  title: string;
  priceINR: string;
  slug: string;
}

interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  discountAmount?: number;
  creatorType?: "ADMIN" | "JYOTISHI";
  creatorName?: string;
}

interface CheckoutSidebarProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  // CHANGED: Accept array of coupons instead of single coupon
  appliedCoupons?: AppliedCoupon[];
  hasAssignedCoupon?: boolean;
  finalPrice?: string;
  originalPrice?: string;
  discountAmount?: string;
  adminDiscountAmount?: string;
  jyotishiDiscountAmount?: string;
  priceAfterAdminDiscount?: string;
  commissionPercourse?: string; // ✅ ADD THIS
}

export const CheckoutSidebar = ({
  course,
  isOpen,
  onClose,
  appliedCoupons = [],
  hasAssignedCoupon = false,
  finalPrice,
  originalPrice,
  discountAmount,
  adminDiscountAmount,
  jyotishiDiscountAmount,
  priceAfterAdminDiscount,
  commissionPercourse, // ✅ ADD THIS
}: CheckoutSidebarProps) => {
  const { data: session } = useSession();

  const [step, setStep] = useState<"coupon" | "payment" | "processing">(
    "payment"
  );
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [isGstValid, setIsGstValid] = useState(false);

  // Use prices from props
  const courseOriginalPrice = parseFloat(originalPrice || course.priceINR);
  const courseFinalPrice = parseFloat(finalPrice || course.priceINR);
  const courseDiscountAmount = parseFloat(discountAmount || "0");
  const courseAdminDiscountAmount = parseFloat(adminDiscountAmount || "0");
  const courseJyotishiDiscountAmount = parseFloat(
    jyotishiDiscountAmount || "0"
  );
  const coursePriceAfterAdminDiscount = parseFloat(
    priceAfterAdminDiscount || courseOriginalPrice.toString()
  );

  // Separate admin and jyotishi coupons
  const adminCoupon = appliedCoupons.find((c) => c.creatorType === "ADMIN");
  const jyotishiCoupon = appliedCoupons.find(
    (c) => c.creatorType === "JYOTISHI"
  );

  // Initialize with assigned coupon if available
  useEffect(() => {
    if (hasAssignedCoupon && appliedCoupons.length > 0) {
      setStep("payment");
    }
  }, [hasAssignedCoupon, appliedCoupons]);

  // GST validation
  const validateGST = (gst: string) => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleGstChange = (value: string) => {
    setGstNumber(value);
    setIsGstValid(validateGST(value));
  };

  // Calculate subtotal (price after all discounts)
  const subtotal = courseFinalPrice;

  // Calculate GST on the discounted price (subtotal)
  const gst = subtotal * 0.18;

  // Total is subtotal + GST
  const total = subtotal + gst;
  const courseCommissionRate = parseFloat(commissionPercourse || "0");
  // Calculate commission
  let commission = 0;
  if (courseJyotishiDiscountAmount > 0 && courseCommissionRate > 0) {
    commission = coursePriceAfterAdminDiscount * (courseCommissionRate / 100);
  }

  const prices = {
    originalPrice: courseOriginalPrice,
    discount: courseDiscountAmount,
    subtotal,
    gst,
    total,
    commission,
    commissionRate: courseCommissionRate, // ✅ ADD THIS
    adminDiscountAmount: courseAdminDiscountAmount,
    jyotishiDiscountAmount: courseJyotishiDiscountAmount,
    priceAfterAdminDiscount: coursePriceAfterAdminDiscount,
    creatorType:
      courseJyotishiDiscountAmount > 0 ? ("JYOTISHI" as const) : undefined,
  };

  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentVerification = async (
    response: RazorpayResponse,
    orderData: any
  ) => {
    try {
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          paymentId: orderData.paymentId,
          courseId: course.id,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();

        if (
          errorData.error?.includes("signature") ||
          errorData.error?.includes("verification")
        ) {
          console.log("Payment verification failed, attempting recovery...");

          const recoveryResponse = await fetch("/api/payment/recover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: orderData.paymentId,
            }),
          });

          if (recoveryResponse.ok) {
            const recoveryData = await recoveryResponse.json();
            if (recoveryData.success) {
              window.location.href = `/dashboard/user/courses`;
              return;
            }
          }
        }

        throw new Error(errorData.error || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();

      if (verifyData.success || verifyData.message) {
        window.location.href = `/dashboard/user/courses`;
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setError(
        err.message.includes("verification failed")
          ? "Payment was successful but verification failed. Please contact support with your payment ID."
          : err.message ||
              "Payment verification failed. Please contact support."
      );
      setStep("payment");
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!session) {
      setError("Please login to proceed with payment");
      return;
    }

    setIsProcessing(true);
    setStep("processing");
    setError("");

    try {
      const res = await initializeRazorpay();
      if (!res) throw new Error("Failed to load payment gateway");

      // FIXED: Send ALL coupon codes, comma-separated
      const couponCodes =
        appliedCoupons.length > 0
          ? appliedCoupons.map((c) => c.code).join(",")
          : null;

      console.log("Sending payment request with coupons:", {
        appliedCoupons,
        couponCodes,
        courseId: course.id,
      });

      // Send payment request with ALL coupon codes
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: couponCodes, // Send comma-separated codes or null
          paymentType: "DOMESTIC",
          billingAddress: null,
          gstNumber: gstNumber || null,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Verify the amount matches what we calculated
      const amountDifference = Math.abs(orderData.amount - prices.total);
      if (amountDifference > 1) {
        console.warn("Amount mismatch detected:", {
          frontend: prices.total,
          backend: orderData.amount,
          difference: amountDifference,
        });

        // Use the backend amount to ensure consistency
        prices.total = orderData.amount;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Math.round(orderData.amount * 100), // Use the amount from backend
        currency: "INR",
        name: "Futuretek",
        description: course.title,
        order_id: orderData.orderId,
        handler: (response: RazorpayResponse) => {
          handlePaymentVerification(response, orderData);
        },
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
          contact: "",
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setStep("payment");
          },
        },
        notes: {
          courseId: course.id,
          courseName: course.title,
          invoiceNumber: orderData.invoiceNumber,
          original_price: prices.originalPrice.toString(),
          admin_discount: prices.adminDiscountAmount.toString(),
          jyotishi_discount: prices.jyotishiDiscountAmount.toString(),
          total_discount: prices.discount.toString(),
          price_after_discount: prices.subtotal.toString(),
          gst_18_percent: prices.gst.toString(),
          final_amount: prices.total.toString(),
          jyotishi_commission: prices.commission.toString(),
          coupons_applied: couponCodes || "",
          gst_number: gstNumber || "",
          user_id: session.user?.id || "",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setError(
          `Payment failed: ${response.error.description || "Please try again"}`
        );
        setStep("payment");
        setIsProcessing(false);
      });

      paymentObject.open();
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setStep("payment");
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-lg z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-500 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Course Info */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg p-3 border border-blue-200">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              {course.title}
            </h3>
            {hasAssignedCoupon ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{courseFinalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{courseOriginalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {adminCoupon && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Crown className="h-3 w-3" />
                      Admin Discount
                    </div>
                  )}
                  {jyotishiCoupon && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Users className="h-3 w-3" />
                      Jyotishi Discount
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-blue-600">
                ₹{courseOriginalPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {/* GST Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              GST Number (Optional)
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => handleGstChange(e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isProcessing}
            />
            {gstNumber && !isGstValid && (
              <p className="text-xs text-red-600">
                Please enter a valid GST number
              </p>
            )}
            {isGstValid && (
              <p className="text-xs text-green-600">
                ✓ Valid GST number format
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                step === "payment" ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                step === "processing" ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Payment Step */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Applied Coupons Notice */}
              {hasAssignedCoupon && appliedCoupons.length > 0 && (
                <div className="space-y-2">
                  {adminCoupon && (
                    <div className="rounded-lg p-3 border bg-green-50 border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                        <div>
                          <p className="font-semibold text-sm mb-0.5 text-green-800">
                            Discount Applied!{" "}
                            {/* Changed from "Admin Discount Applied!" */}
                          </p>
                          <p className="text-xs text-green-700">
                            Coupon{" "}
                            <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs font-mono">
                              {adminCoupon.code}
                            </code>{" "}
                            auto-applied
                          </p>
                          <p className="text-xs mt-0.5 text-green-600">
                            You save ₹
                            {courseAdminDiscountAmount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {jyotishiCoupon && (
                    <div className="rounded-lg p-3 border bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-sm mb-0.5 text-blue-800">
                            Discount Applied!{" "}
                            {/* Changed from "Jyotishi Discount Applied!" */}
                          </p>
                          <p className="text-xs text-blue-700">
                            Coupon{" "}
                            <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs font-mono">
                              {jyotishiCoupon.code}
                            </code>{" "}
                            auto-applied
                          </p>
                          <p className="text-xs mt-0.5 text-blue-600">
                            You save ₹
                            {courseJyotishiDiscountAmount.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-blue-600">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">
                              Supports{" "}
                              {jyotishiCoupon.creatorName || "the Jyotishi"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 className="font-semibold text-sm mb-2">Order Summary</h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Course Price</span>
                    <span className="font-semibold text-sm">
                      ₹{prices.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {prices.adminDiscountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Discount Applied
                      </span>
                      <span className="font-semibold text-green-600 text-sm">
                        -₹{prices.adminDiscountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {prices.jyotishiDiscountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-medium text-sm flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Discount Applied
                      </span>
                      <span className="font-semibold text-blue-600 text-sm">
                        -₹
                        {prices.jyotishiDiscountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-semibold text-sm">
                        ₹{prices.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">GST (18%)</span>
                    <span className="font-semibold text-sm">
                      ₹{prices.gst.toLocaleString("en-IN")}
                    </span>
                  </div>

               
                  <div className="border-t-2 border-blue-200 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">Total Amount</span>
                      <span className="font-bold text-xl text-blue-600">
                        ₹{prices.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      This amount will be charged to Razorpay
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-1.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || (gstNumber ? !isGstValid : false)}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-900 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Pay ₹{prices.total.toLocaleString("en-IN")}
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-center text-gray-500 space-y-0.5">
                <p className="flex items-center justify-center gap-1">
                  <span className="text-green-500">🔒</span>
                  Secure payment powered by Razorpay
                </p>
                <p className="text-xs">100% Money-back guarantee</p>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative z-10" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-base">
                  Processing your payment...
                </p>
                <p className="text-xs text-gray-500">
                  Please don&apos;t close this window
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
