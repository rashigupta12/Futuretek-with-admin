// components/checkout/BuyNowButton.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckoutSidebar } from './CheckoutSidebar'; // Adjust import path as needed

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

  return (
    <>
      <div className="space-y-4">
        {/* Price Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{coursePrice.toLocaleString("en-IN")}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                  Save ₹{(coursePrice - displayPrice).toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ₹{coursePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          
          {/* Assigned Coupon Badge */}
          {hasAssignedCoupon && assignedCoupon && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                <span className="text-sm font-medium">🎉 Coupon Applied!</span>
                <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
                  {assignedCoupon.code}
                </code>
                <span className="text-sm">
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
          className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {hasDiscount ? (
            <>Enroll Now - ₹{displayPrice.toLocaleString("en-IN")}</>
          ) : (
            <>Enroll Now - ₹{coursePrice.toLocaleString("en-IN")}</>
          )}
        </Button>
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