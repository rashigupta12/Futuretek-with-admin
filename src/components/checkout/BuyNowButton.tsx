// ============================================
// FILE: components/checkout/BuyNowButton.tsx
// ============================================
"use client";

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CheckoutSidebar } from './CheckoutSidebar';

interface Course {
  id: string;
  title: string;
  priceINR: string;
  slug: string;
}

export const BuyNowButton = ({ course }: { course: Course }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
 <button
  onClick={() => setIsCheckoutOpen(true)}
  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
>
        <ShoppingCart className="h-5 w-5" />
        Buy Now
      </button>

      <CheckoutSidebar
        course={course}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};