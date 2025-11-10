/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/edit/[id]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// import { toast } from "@/components/ui/use-toast";

type CouponType = {
  id: string;
  code: string;
  name: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
};

type CouponData = {
  id: string;
  couponTypeId: string;
  discountValue: number;
  maxUsage: number | null;
  validForDays: number | null;
  code: string;
};

export default function EditCouponPage() {
  const { id } = useParams();
  const router = useRouter();

  const [types, setTypes] = useState<CouponType[]>([]);
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [validDays, setValidDays] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch coupon types and existing coupon
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, couponRes] = await Promise.all([
          fetch("/api/jyotishi/coupon-types"),
          fetch(`/api/jyotishi/coupons/${id}`),
        ]);

        const typesData = await typesRes.json();
        const couponData = await couponRes.json();

        setTypes(typesData.types || []);
        const c = couponData.coupon;

        setCoupon(c);
        setSelectedType(c.couponTypeId);
        setDiscountValue(c.discountValue.toString());
        setMaxUsage(c.maxUsage?.toString() || "");
        setValidDays(c.validForDays?.toString() || "");
        setPreviewCode(c.code);
      } catch (err) {
        console.log(err)
        // toast({ title: "Error", description: "Failed to load coupon", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Preview code on change
  const previewCoupon = async () => {
    if (!selectedType || !discountValue) {
      setPreviewCode(coupon?.code || "");
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
      setPreviewCode(data.previewCode || coupon?.code || "");
    } catch {
      setPreviewCode(coupon?.code || "");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(previewCoupon, 500);
    return () => clearTimeout(timeout);
  }, [selectedType, discountValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !discountValue) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/jyotishi/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponTypeId: selectedType,
          discountValue: Number(discountValue),
          maxUsage: maxUsage ? Number(maxUsage) : null,
          validForDays: validDays ? Number(validDays) : null,
        }),
      });

      if (res.ok) {
        // toast({ title: "Success", description: "Coupon updated successfully!" });
        router.push("/dashboard/agent/coupons");
      } else {
        const err = await res.json();
        console.log(err)
        // toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
      }
    } catch (err) {
      // toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      console.log(err)
    } finally {
      setSaving(false);
    }
  };

  const selectedTypeObj = types.find(t => t.id === selectedType);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Coupon not found.
      </div>
    );
  }

  return (
    <div className="p-4 w-full mx-auto max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/agent/coupons">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Coupon</h2>
          <p className="text-muted-foreground">Update coupon details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Coupon Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.code} - {t.name} ({t.type === "FIXED_AMOUNT" ? "₹" : "%"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Discount Value{" "}
                  {selectedTypeObj?.type === "PERCENTAGE" ? "(%)" : "(₹)"}
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={selectedTypeObj?.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 500"}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Usage (optional)</Label>
                  <Input
                    type="number"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label>Valid for (days)</Label>
                  <Input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    placeholder="No expiry"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {previewCode && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current / Updated Code</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(previewCode);
                        // toast({ title: "Copied!", description: previewCode });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-2xl font-mono font-bold text-primary">{previewCode}</code>
                <p className="text-sm text-muted-foreground mt-2">
                  {previewCode === coupon.code
                    ? "This is the current code."
                    : "This will be the new code after update."}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/agent/coupons">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || !previewCode}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Coupon"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}