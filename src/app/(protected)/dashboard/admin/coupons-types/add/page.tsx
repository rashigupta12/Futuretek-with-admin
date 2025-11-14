// src/app/(protected)/dashboard/admin/coupons-types/add/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import React, { useEffect, useState } from "react";

export default function AddCouponTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextCode, setNextCode] = useState("");

  const [typeCode, setTypeCode] = useState("");
  const [typeName, setTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("FIXED_AMOUNT");
  const [maxDiscountLimit, setMaxDiscountLimit] = useState("");
  const user = useCurrentUser()
  const adminId = user?.id

  useEffect(() => {
    fetchNextCode();
  }, []);

  const fetchNextCode = async () => {
    try {
      const res = await fetch("/api/admin/coupon-types/next-code");
      const data = await res.json();
      setNextCode(data.nextCode || "");
      setTypeCode(data.nextCode || "");
    } catch (err) {
      console.error("Failed to fetch next code:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    typeCode,
    typeName,
    description,
    discountType,
    maxDiscountLimit,
    adminId
  };

  try {
    const res = await fetch("/api/admin/coupon-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Coupon type created successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      router.push("/dashboard/admin/coupons-types");
    } else {
      const err = await res.json();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.error || 'Failed to create coupon type',
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Unexpected Error',
      text: 'An unexpected error occurred',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/admin/coupons-types"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Coupon Types
      </Link>

      <h1 className="text-2xl font-bold mb-2">Add New Coupon Type</h1>
      <p className="text-muted-foreground mb-6">
        Create a new coupon type template that Jyotishis can use to generate individual coupons.
      </p>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeCode">Type Code (2 digits) *</Label>
                <Input
                  id="typeCode"
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  placeholder="e.g., 01, 10, 25"
                  maxLength={2}
                  pattern="[0-9]{2}"
                />
                {nextCode && (
                  <p className="text-xs text-muted-foreground">
                    Next available code: <span className="font-mono font-bold">{nextCode}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeName">Type Name *</Label>
                <Input
                  id="typeName"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g., EARLYBIRD, FESTIVE, STUDENT"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this coupon type..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount (₹)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {discountType === "PERCENTAGE"
                    ? "Jyotishis can set percentage discounts (e.g., 10%, 20%)"
                    : "Jyotishis can set fixed amount discounts (e.g., ₹500, ₹1000)"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscountLimit">
                  Max Discount Limit *
                  {discountType === "PERCENTAGE" ? " (%)" : " (₹)"}
                </Label>
                <Input
                  id="maxDiscountLimit"
                  type="number"
                  value={maxDiscountLimit}
                  onChange={(e) => setMaxDiscountLimit(e.target.value)}
                  placeholder={
                    discountType === "PERCENTAGE"
                      ? "e.g., 20 (for max 20%)"
                      : "e.g., 1000 (for max ₹1000)"
                  }
                  min="0"
                  max={discountType === "PERCENTAGE" ? "100" : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  {discountType === "PERCENTAGE"
                    ? "Maximum percentage Jyotishis can offer"
                    : "Maximum amount Jyotishis can discount"}
                </p>
              </div>
            </div>

            {/* Example Preview
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Example Coupon Code:</p>
              <code className="text-sm font-mono">
                COUP[JyotishiCode]{typeCode || "XX"}
                {discountType === "PERCENTAGE" ? "[PercentValue]" : "[AmountValue]"}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                e.g., <span className="font-mono">COUPJD001{typeCode || "10"}500</span> - 
                John Doe's coupon with type {typeCode || "10"} offering ₹500 discount
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Coupon Type
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/coupons-types">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}