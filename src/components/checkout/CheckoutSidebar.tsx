/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars*/
"use client";

import React, { useState } from 'react';
import { X, Tag, ShoppingCart, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

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

interface CouponValidation {
  valid: boolean;
  coupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    jyotishiCode: string;
    commissionRate: number;
  };
  discount?: number;
  message?: string;
}

interface PriceSummary {
  coursePrice: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
  commission: number;
}

export const CheckoutSidebar = ({ course, isOpen, onClose }: { 
  course: Course; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [step, setStep] = useState<'coupon' | 'payment' | 'processing'>('coupon');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const coursePrice = parseFloat(course.priceINR);

  const calculatePrices = (): PriceSummary => {
    const discount = appliedCoupon?.discount || 0;
    const subtotal = coursePrice - discount;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    const commission = appliedCoupon?.coupon 
      ? total * (appliedCoupon.coupon.commissionRate / 100)
      : 0;

    return { coursePrice, discount, subtotal, gst, total, commission };
  };

  const prices = calculatePrices();

const validateCoupon = async () => {
  if (!couponCode.trim()) {
    setError('Please enter a coupon code');
    return;
  }

  setIsValidating(true);
  setError('');

  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: couponCode.toUpperCase(),
        courseId: course.id,
        coursePrice: coursePrice
      })
    });

    const data = await response.json();

    if (data.valid) {
      // Calculate discount amount based on coupon type
      let discountAmount = 0;
      
      if (data.coupon.discountType === 'PERCENTAGE') {
        discountAmount = (coursePrice * parseFloat(data.coupon.discountValue)) / 100;
      } else if (data.coupon.discountType === 'FIXED_AMOUNT') {
        discountAmount = parseFloat(data.coupon.discountValue);
      }

      // Create the appliedCoupon object with calculated discount
      const appliedCouponData: CouponValidation = {
        valid: true,
        coupon: {
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: parseFloat(data.coupon.discountValue),
          jyotishiCode: data.coupon.jyotishiCode,
          commissionRate: data.commission ? parseFloat(data.commission.commissionRate) : 0
        },
        discount: discountAmount,
        message: 'Coupon applied successfully'
      };

      setAppliedCoupon(appliedCouponData);
      setError('');
    } else {
      setError(data.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  } catch (err) {
    console.log(err)
    setError('Failed to validate coupon. Please try again.');
    setAppliedCoupon(null);
  } finally {
    setIsValidating(false);
  }
};

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
  };
const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded with type assertion
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePayment = async () => {
  setIsProcessing(true);
  setStep('processing');
  setError('');

  try {
    const res = await initializeRazorpay();
    if (!res) {
      throw new Error('Failed to load payment gateway');
    }

    const orderResponse = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: course.id,
        couponCode: appliedCoupon?.coupon?.code,
        amount: Math.round(prices.total * 100),
        paymentType: "DOMESTIC",
        billingAddress: null
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }

    const orderData = await orderResponse.json();

    // Debug log to see the actual response structure
    console.log('Order data received:', orderData);

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: orderData.amount * 100, // Use orderData.amount directly (already in paise)
      currency: orderData.currency,
      name: 'Futuretek',
      description: course.title,
      order_id: orderData.orderId, // Use orderData.orderId directly
      handler: async function (response: RazorpayResponse) {
        try {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId, // Use orderData.paymentId directly
              courseId: course.id
            })
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          const verifyData = await verifyResponse.json();

          if (verifyData.success || verifyData.message) {
            // Redirect to success page or dashboard
            window.location.href = `/dashboard/courses?enrollment=${verifyData.enrollment?.id}`;
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (err: any) {
          console.error('Payment verification error:', err);
          setError(err.message || 'Payment verification failed. Please contact support.');
          setStep('payment');
          setIsProcessing(false);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#8b5cf6'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setIsProcessing(false);
          setStep('payment');
        }
      },
      notes: {
        courseId: course.id,
        courseName: course.title,
        invoiceNumber: orderData.invoiceNumber
      }
    };

    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      setError(`Payment failed: ${response.error.description || 'Please try again'}`);
      setStep('payment');
      setIsProcessing(false);
    });

    paymentObject.open();

  } catch (err: any) {
    console.error('Payment initialization error:', err);
    setError(err.message || 'Payment failed. Please try again.');
    setStep('payment');
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

      <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto pt-10">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ₹{coursePrice.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-2 rounded-full ${step === 'coupon' ? 'bg-purple-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${step === 'payment' ? 'bg-purple-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${step === 'processing' ? 'bg-purple-500' : 'bg-gray-300'}`} />
          </div>

          {step === 'coupon' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Have a coupon code?</h3>
              </div>

              {!appliedCoupon ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono uppercase"
                      onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={isValidating || !couponCode.trim()}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      {isValidating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Apply'}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-3 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Skip & Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-700 dark:text-green-400 text-lg">
                          Coupon Applied!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500 font-mono">
                          {appliedCoupon.coupon?.code}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      You save ₹{prices.discount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="space-y-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Course Price</span>
                    <span className="font-semibold">₹{prices.coursePrice.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedCoupon && prices.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">Coupon Discount</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -₹{prices.discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 dark:border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-semibold">₹{prices.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                    <span className="font-semibold">₹{prices.gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t-2 border-purple-200 dark:border-purple-800 pt-4 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-bold text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ₹{prices.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {appliedCoupon && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                        Coupon: {appliedCoupon.coupon?.code}
                      </p>
                      <p className="text-blue-600 dark:text-blue-500">
                        🎉 You &apos;re saving ₹{prices.discount.toLocaleString('en-IN')} on this purchase!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Pay ₹{prices.total.toLocaleString('en-IN')}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep('coupon')}
                  disabled={isProcessing}
                  className="w-full py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  ← Back
                </button>
              </div>

              <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <span className="text-green-500">🔒</span>
                  Secure payment powered by Razorpay
                </p>
                <p>100% Money-back guarantee • Instant access after payment</p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" />
                <Loader2 className="h-16 w-16 animate-spin text-purple-600 relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold">Processing your payment...</p>
                <p className="text-sm text-gray-500">
                  Please don&apos;t close this window or press back button
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};