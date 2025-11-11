"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { AlertCircle, IndianRupee, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  invoiceNumber: string;
  amount: string;
  finalAmount: string;
  currency: "INR";
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: string;
  courseTitle: string;
}

export default function PaymentsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/user/payments`);
        if (!res.ok) throw new Error("Failed to load payments");

        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [userId]);

  const getStatusBadge = (status: Payment["status"]) => {
    const config = {
      COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
      FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
      REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-700" },
    };
    const { label, color } = config[status] || config.PENDING;
    return <Badge className={color}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Error</h3>
          <p className="text-gray-600 mt-1">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Payments Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Your payment history will appear here once you enroll in a course.
          </p>
          <Button asChild>
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1">
          View all your course purchases and invoices
        </p>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{payment.courseTitle}</CardTitle>
                  <CardDescription>
                    Invoice Number: {payment.invoiceNumber}
                  </CardDescription>
                </div>
                {getStatusBadge(payment.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{Number(payment.finalAmount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium">
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Paid on</span>
                <span className="font-medium">
                  {format(new Date(payment.createdAt), "dd MMM yyyy, hh:mm a")}
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t bg-gray-50">
              <span className="text-xs text-gray-500">
                Invoice download coming soon
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
