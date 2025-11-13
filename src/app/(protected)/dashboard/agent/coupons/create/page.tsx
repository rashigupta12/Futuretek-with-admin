/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
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

    // Frontend validation for discount value
    if (selectedTypeObj?.maxDiscountLimit) {
      const maxDiscount = Number(selectedTypeObj.maxDiscountLimit);
      const enteredDiscount = Number(discountValue);
      
      if (enteredDiscount > maxDiscount) {
        alert(`Discount value cannot exceed ${maxDiscount}${selectedTypeObj.discountType === "PERCENTAGE" ? '%' : '₹'}`);
        return;
      }
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

      const result = await res.json();

      if (res.ok) {
        // toast({ title: "Success", description: "Coupon created!" });
        router.push("/dashboard/agent/coupons");
      } else {
        // toast({
        //   title: "Error",
        //   description: result.error || "Failed to create coupon",
        //   variant: "destructive",
        // });
        alert(result.error || "Failed to create coupon");
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
const isDiscountExceeded = selectedTypeObj?.maxDiscountLimit ? 
  Number(discountValue) > Number(selectedTypeObj.maxDiscountLimit) : false;

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
          <Link href="/dashboard/agent/coupons">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Coupon
          </h2>
          <p className="text-gray-600">
            Generate a unique discount code
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">

          {/* ---------- Coupon Details ---------- */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                Coupon Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              {/* Coupon Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Coupon Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{t.typeCode} - {t.typeName}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            t.discountType === "FIXED_AMOUNT" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {t.discountType === "FIXED_AMOUNT" ? "₹" : "%"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Discount Value{" "}
                  {selectedTypeObj?.discountType === "PERCENTAGE" ? 
                    <span className="text-amber-600">(%)</span> : 
                    <span className="text-blue-600">(₹)</span>
                  }
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
                  className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    isDiscountExceeded ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
                  }`}
                  required
                />
                {selectedTypeObj?.maxDiscountLimit && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Maximum allowed: <span className="font-medium">{selectedTypeObj.maxDiscountLimit}{selectedTypeObj.discountType === "PERCENTAGE" ? '%' : '₹'}</span>
                    </p>
                    {isDiscountExceeded && (
                      <p className="text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Exceeds maximum limit
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Max Usage */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Max Usage (optional)</Label>
                <Input
                  type="number"
                  value={maxUsageCount}
                  onChange={(e) => setMaxUsageCount(e.target.value)}
                  placeholder="Unlimited"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valid From */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Valid From *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {validFrom ? format(validFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border border-gray-200 shadow-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={validFrom}
                        onSelect={setValidFrom}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Valid Until */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Valid Until *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {validUntil ? format(validUntil, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border border-gray-200 shadow-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={validUntil}
                        onSelect={setValidUntil}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---------- Preview ---------- */}
          {previewCode && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                    Preview Code
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500"
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
                <code className="text-2xl font-mono font-bold text-blue-600 bg-white px-4 py-3 rounded-lg border border-blue-200 inline-block">
                  {previewCode}
                </code>
                <p className="text-sm text-gray-600 mt-3">
                  This code will be generated upon submission.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ---------- Actions ---------- */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              asChild
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Link href="/dashboard/agent/coupons">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isDiscountExceeded}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}