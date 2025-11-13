/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AlertCircle, CheckCircle2, Loader2, ShoppingCart, X, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  discountAmount?: number;
  creatorType?: 'ADMIN' | 'JYOTISHI';
  creatorName?: string;
}

interface PriceSummary {
  originalPrice: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
  commission: number;
  creatorType?: 'ADMIN' | 'JYOTISHI';
}

interface CheckoutSidebarProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  assignedCoupon?: AppliedCoupon;
  hasAssignedCoupon?: boolean;
  finalPrice?: string;
  originalPrice?: string;
  discountAmount?: string;
}

export const CheckoutSidebar = ({ 
  course, 
  isOpen, 
  onClose, 
  assignedCoupon,
  hasAssignedCoupon = false,
  finalPrice,
  originalPrice,
  discountAmount
}: CheckoutSidebarProps) => {
  const { data: session } = useSession();
  
  // Always start on payment step (coupon step is disabled)
  const [step, setStep] = useState<'coupon' | 'payment' | 'processing'>('payment');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use prices from props (same as course detail page)
  const courseOriginalPrice = parseFloat(originalPrice || course.priceINR);
  const courseFinalPrice = parseFloat(finalPrice || course.priceINR);
  const courseDiscountAmount = parseFloat(discountAmount || "0");

  // Initialize with assigned coupon if available
  useEffect(() => {
    if (hasAssignedCoupon && assignedCoupon) {
      setStep('payment');
    }
  }, [hasAssignedCoupon, assignedCoupon]);

  const calculatePrices = (): PriceSummary => {
    let discount = courseDiscountAmount;
    let subtotal = courseFinalPrice;
    let commission = 0;
    let creatorType: 'ADMIN' | 'JYOTISHI' | undefined = undefined;
    
    if (hasAssignedCoupon && assignedCoupon) {
      // For display purposes only - show commission for Jyotishi coupons
      if (assignedCoupon.creatorType === "JYOTISHI") {
        // Example: 10% commission on discounted price for display
        commission = subtotal * 0.10;
        creatorType = "JYOTISHI";
      }
    }
    
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    return { 
      originalPrice: courseOriginalPrice, 
      discount, 
      subtotal, 
      gst, 
      total, 
      commission,
      creatorType 
    };
  };

  const prices = calculatePrices();

  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
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

  const handlePaymentVerification = async (response: RazorpayResponse, orderData: any) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          paymentId: orderData.paymentId,
          courseId: course.id
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        
        // If verification fails, try to recover
        if (errorData.error?.includes('signature') || errorData.error?.includes('verification')) {
          console.log('Payment verification failed, attempting recovery...');
          
          const recoveryResponse = await fetch('/api/payment/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.paymentId
            })
          });

          if (recoveryResponse.ok) {
            const recoveryData = await recoveryResponse.json();
            if (recoveryData.success) {
              // Recovery successful
              window.location.href = `/dashboard/user/courses`;
              return;
            }
          }
        }
        
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const verifyData = await verifyResponse.json();

      if (verifyData.success || verifyData.message) {
        window.location.href = `/dashboard/user/courses`;
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      
      // Show user-friendly error message with recovery options
      setError(
        err.message.includes('verification failed') 
          ? 'Payment was successful but verification failed. Please contact support with your payment ID.'
          : err.message || 'Payment verification failed. Please contact support.'
      );
      
      setStep('payment');
      setIsProcessing(false);
    }
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
      if (!res) throw new Error('Failed to load payment gateway');

      const activeCouponCode = hasAssignedCoupon ? assignedCoupon?.code : undefined;

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

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'Futuretek',
        description: course.title,
        order_id: orderData.orderId,
        handler: (response: RazorpayResponse) => {
          handlePaymentVerification(response, orderData);
        },
        prefill: {
          name: session.user?.name || '',
          email: session.user?.email || '',
          contact: ''
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
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
                    ₹{courseFinalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{courseOriginalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  assignedCoupon?.creatorType === 'JYOTISHI' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {assignedCoupon?.creatorType === 'JYOTISHI' ? 'Jyotishi Discount' : 'Admin Discount'}
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-blue-600">
                ₹{courseOriginalPrice.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${step === 'payment' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${step === 'processing' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          </div>

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-4">
              {/* Assigned Coupon Notice */}
              {hasAssignedCoupon && assignedCoupon && (
                <div className={`rounded-lg p-3 border ${
                  assignedCoupon.creatorType === 'JYOTISHI'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        assignedCoupon.creatorType === 'JYOTISHI' ? 'text-blue-600' : 'text-amber-600'
                      }`} />
                      <div>
                        <p className={`font-semibold text-sm mb-0.5 ${
                          assignedCoupon.creatorType === 'JYOTISHI' ? 'text-blue-800' : 'text-amber-800'
                        }`}>
                          {assignedCoupon.creatorType === 'JYOTISHI' ? 'Jyotishi Discount Applied!' : 'Admin Discount Applied!'}
                        </p>
                        <p className={`text-xs ${
                          assignedCoupon.creatorType === 'JYOTISHI' ? 'text-blue-700' : 'text-amber-700'
                        }`}>
                          Coupon <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs font-mono">{assignedCoupon.code}</code> auto-applied
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          assignedCoupon.creatorType === 'JYOTISHI' ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          You save ₹{courseDiscountAmount.toLocaleString('en-IN')}
                        </p>
                        
                        {/* Commission Notice for Jyotishi Coupons */}
                        {assignedCoupon.creatorType === 'JYOTISHI' && (
                          <div className="flex items-center gap-1 mt-1 text-blue-600">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">Supports {assignedCoupon.creatorName || 'the Jyotishi'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 className="font-semibold text-sm mb-2">Order Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Course Price</span>
                    <span className="font-semibold text-sm">₹{prices.originalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {prices.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium text-sm">
                        Discount Applied
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

                  {/* Commission Display - Only for Jyotishi coupons */}
                  {prices.commission > 0 && prices.creatorType === "JYOTISHI" && (
                    <div className="flex justify-between items-center text-xs bg-blue-50 p-2 rounded border border-blue-100">
                      <span className="text-blue-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Jyotishi Commission
                      </span>
                      <span className="text-blue-600 font-medium">
                        ₹{prices.commission.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

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