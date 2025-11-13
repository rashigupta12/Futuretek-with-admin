/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Edit, Trash2, Users, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { toast } from "@/components/ui/use-toast";

type CouponDetail = {
  id: string;
  code: string;
  typeName: string;
  discountValue: number;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  usageCount: number;
  maxUsage: number | null;
  status: string;
  validUntil: string | null;
  createdAt: string;
  usedBy: { user: { name: string; email: string }; usedAt: string }[];
};

export default function ViewCouponPage() {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const res = await fetch(`/api/jyotishi/coupons/${id}`);
      const data = await res.json();
      setCoupon(data.coupon);
    } catch (err) {
      console.log(err)
      // toast({ title: "Error", description: "Failed to load coupon", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this coupon permanently?")) return;
    try {
      await fetch(`/api/jyotishi/coupons/${id}`, { method: "DELETE" });
      // toast({ title: "Deleted", description: "Coupon removed" });
      router.push("/dashboard/agent/coupons");
    } catch {
      // toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!coupon) return <div className="p-8 text-center">Coupon not found</div>;

  return (
    <div className="p-4 w-full mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/agent/coupons">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Coupon: {coupon.code}</h2>
            <p className="text-muted-foreground">Detailed view and usage history</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/agent/coupons/edit/${id}`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" /> Coupon Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <code className="text-xl font-mono font-bold">{coupon.code}</code>
              <Button size="sm" onClick={() => { navigator.clipboard.writeText(coupon.code);  }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
            </p>
            <p className="text-sm text-muted-foreground">{coupon.typeName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={coupon.status === "ACTIVE" ? "default" : coupon.status === "EXPIRED" ? "destructive" : "secondary"}>
              {coupon.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Validity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Created:</strong> {new Date(coupon.createdAt).toLocaleDateString()}</p>
            <p><strong>Expires:</strong> {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Never"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Used:</strong> {coupon.usageCount} {coupon.maxUsage ? `/ ${coupon.maxUsage}` : ""}</p>
          </CardContent>
        </Card>
      </div>

      {coupon.usedBy.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Students Who Used This Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coupon.usedBy.map((u, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{u.user.name}</p>
                    <p className="text-sm text-muted-foreground">{u.user.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(u.usedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}