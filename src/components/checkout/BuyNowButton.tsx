// components/checkout/BuyNowButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { CheckoutSidebar } from './CheckoutSidebar';

interface Course {
  id: string;
  title: string;
  priceINR: string;
  slug: string;
}

interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
}

interface BuyNowButtonProps {
  course: Course;
  assignedCoupon?: AppliedCoupon;
  finalPrice?: string;
  hasAssignedCoupon?: boolean;
}

export function BuyNowButton({ 
  course, 
  assignedCoupon, 
  finalPrice, 
  hasAssignedCoupon = false 
}: BuyNowButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const coursePrice = parseFloat(course.priceINR);
  const displayPrice = hasAssignedCoupon && finalPrice ? parseFloat(finalPrice) : coursePrice;
  const hasDiscount = hasAssignedCoupon && displayPrice < coursePrice;
  const discountAmount = coursePrice - displayPrice;

  return (
    <>
      <div className="space-y-4">
        {/* Price Display */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 mb-3">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{coursePrice.toLocaleString("en-IN")}
                  </span>
               
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                  Save ₹{discountAmount.toLocaleString("en-IN")}
                </div>
                 </div>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ₹{coursePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          
          {/* Assigned Coupon Badge */}
          {hasAssignedCoupon && assignedCoupon && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                <span className="text-sm font-medium">Coupon Applied</span>
                <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono border border-green-200">
                  {assignedCoupon.code}
                </code>
                <span className="text-sm text-green-600">
                  ({assignedCoupon.discountType === 'PERCENTAGE' ? 
                    `${assignedCoupon.discountValue}% off` : 
                    `₹${assignedCoupon.discountValue} off`})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Buy Now Button */}
        <Button
          onClick={() => setShowCheckout(true)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
        >
          {hasDiscount ? (
            <>Enroll Now - ₹{displayPrice.toLocaleString("en-IN")}</>
          ) : (
            <>Enroll Now - ₹{coursePrice.toLocaleString("en-IN")}</>
          )}
        </Button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Secure payment
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            30-day guarantee
          </span>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <CheckoutSidebar
        course={course}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        assignedCoupon={assignedCoupon}
        hasAssignedCoupon={hasAssignedCoupon}
        finalPrice={finalPrice}
      />
    </>
  );
}