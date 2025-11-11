/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars*/
"use client";

import React, { useState, useEffect } from 'react';
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

interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
}

interface CheckoutSidebarProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  assignedCoupon?: AppliedCoupon;
  hasAssignedCoupon?: boolean;
  finalPrice?: string;
}

export const CheckoutSidebar = ({ 
  course, 
  isOpen, 
  onClose, 
  assignedCoupon,
  hasAssignedCoupon = false,
  finalPrice
}: CheckoutSidebarProps) => {
  const { data: session } = useSession();
  const [step, setStep] = useState<'coupon' | 'payment' | 'processing'>(
    hasAssignedCoupon ? 'payment' : 'coupon'
  );
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const coursePrice = parseFloat(course.priceINR);
  const displayFinalPrice = hasAssignedCoupon && finalPrice ? parseFloat(finalPrice) : coursePrice;

  // Initialize with assigned coupon if available
  useEffect(() => {
    if (hasAssignedCoupon && assignedCoupon) {
      const discountAmount = coursePrice - displayFinalPrice;
      
      const assignedCouponData: CouponValidation = {
        valid: true,
        coupon: {
          code: assignedCoupon.code,
          discountType: assignedCoupon.discountType,
          discountValue: parseFloat(assignedCoupon.discountValue),
          jyotishiCode: '', // You might want to get this from your API
          commissionRate: 0 // You might want to get this from your API
        },
        discount: discountAmount,
        message: 'Auto-applied coupon'
      };
      
      setAppliedCoupon(assignedCouponData);
      setStep('payment');
    }
  }, [hasAssignedCoupon, assignedCoupon, coursePrice, displayFinalPrice]);

  const calculatePrices = (): PriceSummary => {
    let discount = 0;
    let subtotal = coursePrice;
    
    if (hasAssignedCoupon) {
      // Use assigned coupon discount
      discount = coursePrice - displayFinalPrice;
      subtotal = displayFinalPrice;
    } else if (appliedCoupon?.discount) {
      // Use manually applied coupon discount
      discount = appliedCoupon.discount;
      subtotal = coursePrice - discount;
    }
    
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

  const handleRemoveAssignedCoupon = () => {
    setAppliedCoupon(null);
    setStep('coupon');
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
    if (!session) {
      setError('Please login to proceed with payment');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      const res = await initializeRazorpay();
      if (!res) {
        throw new Error('Failed to load payment gateway');
      }

      // Determine which coupon to use
      const activeCouponCode = hasAssignedCoupon ? assignedCoupon?.code : appliedCoupon?.coupon?.code;

      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: activeCouponCode,
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
              window.location.href = `/dashboard/user/courses`;
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
          name: session.user?.name || '',
          email: session.user?.email || '',
          contact: ''
        },
        theme: {
          color: '#2563eb' // Blue color
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
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{course.title}</h3>
            {hasAssignedCoupon ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{displayFinalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{coursePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium inline-block">
                  Coupon Applied!
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-blue-600">
                ₹{coursePrice.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${step === 'coupon' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${step === 'payment' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${step === 'processing' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>

          {/* Coupon Step */}
          {step === 'coupon' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Have a coupon code?</h3>
              </div>

              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={isValidating || !couponCode.trim()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] text-sm"
                    >
                      {isValidating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Apply'}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    Skip & Continue
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-700 text-sm">
                          Coupon Applied!
                        </p>
                        <p className="text-xs text-green-600 font-mono">
                          {appliedCoupon.coupon?.code}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-600 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      You save ₹{prices.discount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-4">
              {/* Assigned Coupon Notice */}
              {hasAssignedCoupon && assignedCoupon && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 text-sm mb-0.5">
                          Special Discount Applied!
                        </p>
                        <p className="text-amber-700 text-xs">
                          Coupon <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">{assignedCoupon.code}</code> auto-applied
                        </p>
                        <p className="text-amber-600 text-xs mt-0.5">
                          You save ₹{(coursePrice - displayFinalPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveAssignedCoupon}
                      className="text-red-500 hover:text-red-600 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 className="font-semibold text-sm mb-2">Order Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Course Price</span>
                    <span className="font-semibold text-sm">₹{prices.coursePrice.toLocaleString('en-IN')}</span>
                  </div>

                  {(hasAssignedCoupon || appliedCoupon) && prices.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium text-sm">
                        {hasAssignedCoupon ? 'Auto Discount' : 'Coupon Discount'}
                      </span>
                      <span className="font-semibold text-green-600 text-sm">
                        -₹{prices.discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-semibold text-sm">₹{prices.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">GST (18%)</span>
                    <span className="font-semibold text-sm">₹{prices.gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t-2 border-blue-200 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">Total Amount</span>
                      <span className="font-bold text-xl text-blue-600">
                        ₹{prices.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applied Coupon Display */}
              {appliedCoupon && !hasAssignedCoupon && (
                <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-blue-700 mb-0.5">
                        Coupon: {appliedCoupon.coupon?.code}
                      </p>
                      <p className="text-blue-600">
                        You save ₹{prices.discount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-1.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
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
                      Pay ₹{prices.total.toLocaleString('en-IN')}
                    </>
                  )}
                </button>

                {!hasAssignedCoupon && (
                  <button
                    onClick={() => setStep('coupon')}
                    disabled={isProcessing}
                    className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    ← Back to Coupon
                  </button>
                )}
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
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative z-10" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-base">Processing your payment...</p>
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