/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
// import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type CouponType = {
  id: string;
  typeCode: string;
  typeName: string;
  description?: string;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  maxDiscountLimit?: string;
};

export default function CreateCouponPage() {
  const [types, setTypes] = useState<CouponType[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUsageCount, setMaxUsageCount] = useState("");
  const [validFrom, setValidFrom] = useState<Date | undefined>(undefined);
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined);
  const [previewCode, setPreviewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ------------------------------------------------------------------ */
  /* 1. Load coupon types                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/jyotishi/coupon-types");
      const data = await res.json();
      setTypes(data.couponTypes || []);
    } catch (err) {
      console.log(err)
      // toast({
      //   title: "Error",
      //   description: "Failed to load coupon types",
      //   variant: "destructive",
      // });
    }
  };

  /* ------------------------------------------------------------------ */
  /* 2. Live preview (unchanged)                                        */
  /* ------------------------------------------------------------------ */
  const previewCoupon = async () => {
    if (!selectedType || !discountValue) {
      setPreviewCode("");
      return;
    }

    try {
      const res = await fetch("/api/jyotishi/coupons/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponTypeId: selectedType,
          discountValue: Number(discountValue),
        }),
      });
      const data = await res.json();
      setPreviewCode(data.previewCode || "");
    } catch {
      setPreviewCode("");
    }
  };

  useEffect(() => {
    const t = setTimeout(previewCoupon, 400);
    return () => clearTimeout(t);
  }, [selectedType, discountValue]);

  /* ------------------------------------------------------------------ */
  /* 3. Submit – matches new API                                        */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !discountValue || !validFrom || !validUntil) {
      console.log("missing field ")
      // toast({
      //   title: "Missing fields",
      //   description: "Coupon type, discount, and both dates are required.",
      //   variant: "destructive",
      // });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        couponTypeId: selectedType,
        discountValue: Number(discountValue),
        maxUsageCount: maxUsageCount ? Number(maxUsageCount) : null,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        // optional fields – add if you need them later
        // description: "...",
        // courseIds: [...]
      };

      const res = await fetch("/api/jyotishi/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // const result = await res.json();

      if (res.ok) {
        // toast({ title: "Success", description: "Coupon created!" });
        router.push("/dashboard/agent/coupons");
      } else {
        // toast({
        //   title: "Error",
        //   description: result.error || "Failed to create coupon",
        //   variant: "destructive",
        // });
      }
    } catch (err) {
      console.log(err)
      // toast({
      //   title: "Network error",
      //   description: "Something went wrong. Try again.",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeObj = types.find((t) => t.id === selectedType);

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-4 w-full mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/agent/coupons">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Create New Coupon
          </h2>
          <p className="text-muted-foreground">
            Generate a unique discount code
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">

          {/* ---------- Coupon Details ---------- */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Coupon Type */}
              <div>
                <Label>Coupon Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.typeCode} - {t.typeName} (
                        {t.discountType === "FIXED_AMOUNT" ? "₹" : "%"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div>
                <Label>
                  Discount Value{" "}
                  {selectedTypeObj?.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={
                    selectedTypeObj?.discountType === "PERCENTAGE"
                      ? "e.g. 20"
                      : "e.g. 500"
                  }
                  required
                />
              </div>

              {/* Max Usage */}
              <div>
                <Label>Max Usage (optional)</Label>
                <Input
                  type="number"
                  value={maxUsageCount}
                  onChange={(e) => setMaxUsageCount(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>

              {/* Valid From */}
              <div>
                <Label>Valid From *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validFrom ? format(validFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validFrom}
                      onSelect={setValidFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Valid Until */}
              <div>
                <Label>Valid Until *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? format(validUntil, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={setValidUntil}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* ---------- Preview ---------- */}
          {previewCode && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview Code</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(previewCode);
                      // toast({ title: "Copied!" });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-2xl font-mono font-bold text-primary">
                  {previewCode}
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  This code will be generated upon submission.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ---------- Actions ---------- */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/agent/coupons">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}