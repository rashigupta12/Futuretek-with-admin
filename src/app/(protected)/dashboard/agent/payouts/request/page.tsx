"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      // toast({
      //   title: "Insufficient balance",
      //   description: `You only have ₹${available.toLocaleString()} available for payout.`,
      //   variant: "destructive",
      // });
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

      // toast({
      //   title: "Payout requested",
      //   description: `₹${data.amount.toLocaleString()} request submitted successfully.`,
      // });
      reset();
    } catch (err) {
      console.error("Payout request failed:", err);
      // toast({
      //   title: "Error",
      //   description: "Could not submit payout request. Try again later.",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Payout</h1>
        <p className="text-muted-foreground">
          Withdraw your earned commissions to your bank account.
        </p>
      </div>

      {/* ---- Available Balance ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ₹{available.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Only pending commissions can be requested.
          </p>
        </CardContent>
      </Card>

      {/* ---- Payout Form ---- */}
      <Card>
        <CardHeader>
          <CardTitle>New Payout Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="15000"
                {...register("amount")}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
              )}
              {watchedAmount && watchedAmount > available && (
                <p className="text-sm text-red-600 mt-1">
                  Requested amount exceeds available balance.
                </p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bank details</AlertTitle>
              <AlertDescription>
                Payouts are transferred to the bank account linked in your{" "}
                <a href="/dashboard/agent/profile" className="underline">
                  profile
                </a>
                . Make sure it’s up-to-date.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting…" : "Request Payout"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
