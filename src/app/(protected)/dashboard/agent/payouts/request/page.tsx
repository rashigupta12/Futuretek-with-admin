"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DollarSign, AlertCircle, Wallet, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2"
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .max(500000, "Maximum ₹5,00,000 per request"),
});

type FormData = z.infer<typeof schema>;

export default function RequestPayoutPage() {
  // const { toast } = useToast();
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedAmount = watch("amount");

  // ✅ Fetch balance from new earnings API
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/jyotishi/earnings");
        const data = await res.json();

        const pending = Number(data?.stats?.pendingEarnings ?? 0);
        setAvailable(pending);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, []);

const onSubmit = async (data: FormData) => {
  if (data.amount > available) {
    Swal.fire({
      icon: 'warning',
      title: 'Insufficient Balance',
      text: `You only have ₹${available.toLocaleString()} available for payout.`,
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/jyotishi/payouts/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: data.amount }),
    });

    if (!res.ok) throw new Error("Failed to create payout request");

    await Swal.fire({
      icon: 'success',
      title: 'Payout Requested!',
      text: `₹${data.amount.toLocaleString()} request submitted successfully.`,
      timer: 3000,
      showConfirmButton: false
    });
    
    reset();
  } catch (err) {
    console.error("Payout request failed:", err);
    Swal.fire({
      icon: 'error',
      title: 'Request Failed',
      text: 'Could not submit payout request. Please try again later.',
      confirmButtonColor: '#d33',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Request Payout</h1>
        <p className="text-gray-600 mt-1">
          Withdraw your earned commissions to your bank account.
        </p>
      </div>

      {/* ---- Available Balance ---- */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ₹{available.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Only pending commissions can be requested for payout.
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Payout Form ---- */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
            New Payout Request
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount (₹)
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="15000"
                  {...register("amount")}
                  className={`pl-3 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.amount ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {errors.amount && (
                <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount.message}
                </p>
              )}
              {watchedAmount && watchedAmount > available && (
                <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Requested amount exceeds available balance.
                </p>
              )}
            </div>

            {/* Info Alert */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Bank details</AlertTitle>
              <AlertDescription className="text-blue-700">
                Payouts are transferred to the bank account linked in your{" "}
                <a href="/dashboard/agent/profile" className="underline font-medium hover:text-blue-800">
                  profile
                </a>
                . Make sure it&apos;s up-to-date.
              </AlertDescription>
            </Alert>

            {/* Additional Info Card */}
            <Card className="border border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Processing Time</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Payout requests are typically processed within 3-5 business days. 
                      You&apos;ll receive email notifications for status updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm py-2.5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Request...
                </span>
              ) : (
                "Request Payout"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}