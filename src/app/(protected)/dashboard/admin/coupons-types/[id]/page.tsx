// src/app/(protected)/dashboard/admin/coupon-types/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Ticket,
  Users,
  TrendingUp,
  AlertCircle,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CouponType = {
  id: string;
  typeCode: string;
  typeName: string;
  description: string;
  discountType: string;
  maxDiscountLimit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    coupons: number;
  };
  coupons?: Array<{
    id: string;
    code: string;
    discountValue: string;
    maxUsageCount: number;
    currentUsageCount: number;
    isActive: boolean;
    createdBy: {
      name: string;
      jyotishiCode: string;
    };
  }>;
};

export default function ViewCouponTypePage() {
  const params = useParams();
  const router = useRouter();
  const [couponType, setCouponType] = useState<CouponType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchCouponType();
  }, [params.id]);

  const fetchCouponType = async () => {
    try {
      const res = await fetch(`/api/admin/coupon-types/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setCouponType(data.couponType);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to deactivate this coupon type?")) return;
    try {
      const res = await fetch(`/api/admin/coupon-types/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Coupon type deactivated successfully");
        router.push("/dashboard/admin/coupon-types");
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Error deleting coupon type");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );

  if (!couponType)
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Coupon Type Not Found
        </h2>
        <Button asChild>
          <Link href="/dashboard/admin/coupon-types">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Coupon Types
          </Link>
        </Button>
      </div>
    );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN");

  const getStatusColor = (isActive: boolean) =>
    isActive ? "bg-green-500" : "bg-gray-500";

  const totalCoupons = couponType._count?.coupons || 0;
  const activeCoupons =
    couponType.coupons?.filter((c) => c.isActive).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/admin/coupon-types"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Coupon Types
              </Link>
              <Badge variant="outline" className="text-xs">
                ADMIN VIEW
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <span className="text-2xl font-bold text-white font-mono">
                  {couponType.typeCode}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {couponType.typeName}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Type Code: {couponType.typeCode}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={`text-white ${getStatusColor(couponType.isActive)}`}
              >
                {couponType.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={
                  couponType.discountType === "PERCENTAGE" ? "default" : "secondary"
                }
              >
                {couponType.discountType === "PERCENTAGE"
                  ? "Percentage Discount"
                  : "Fixed Amount Discount"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="leading-relaxed">
                      {couponType.description || "No description provided."}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                        <Hash className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Type Code</div>
                        <div className="font-mono font-bold text-lg">
                          {couponType.typeCode}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Max Discount Limit
                        </div>
                        <div className="font-bold text-lg">
                          {couponType.discountType === "PERCENTAGE"
                            ? `${couponType.maxDiscountLimit}%`
                            : `₹${Number(couponType.maxDiscountLimit).toLocaleString("en-IN")}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Code Format */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Coupon Code Format</CardTitle>
                <CardDescription>
                  How coupons are generated using this type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Structure:</span>
                    </div>
                    <div className="text-lg font-bold">
                      COUP[JyotishiCode]{couponType.typeCode}
                      {couponType.discountType === "PERCENTAGE"
                        ? "[PercentValue]"
                        : "[AmountValue]"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Example Coupon Codes:</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="p-3 bg-muted/30 rounded font-mono text-sm">
                          COUPJD001{couponType.typeCode}
                          {couponType.discountType === "PERCENTAGE" ? "015" : "500"}
                        </div>
                        <p className="text-xs text-muted-foreground pl-3">
                          John Doe&apos;s coupon offering{" "}
                          {couponType.discountType === "PERCENTAGE"
                            ? "15% discount"
                            : "₹500 discount"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="p-3 bg-muted/30 rounded font-mono text-sm">
                          COUPAS001{couponType.typeCode}
                          {couponType.discountType === "PERCENTAGE" ? "020" : "1000"}
                        </div>
                        <p className="text-xs text-muted-foreground pl-3">
                          Alice Smith&apos;s coupon offering{" "}
                          {couponType.discountType === "PERCENTAGE"
                            ? "20% discount"
                            : "₹1000 discount"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Coupons */}
            {couponType.coupons && couponType.coupons.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Recent Coupons</CardTitle>
                  <CardDescription>
                    Latest coupons created using this type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {couponType.coupons.slice(0, 5).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-mono font-bold">{coupon.code}</div>
                          <div className="text-sm text-muted-foreground">
                            By {coupon.createdBy.name} ({coupon.createdBy.jyotishiCode})
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-medium">
                            {couponType.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.currentUsageCount}/{coupon.maxUsageCount} used
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">Statistics</CardTitle>
                <CardDescription>Usage metrics for this type</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-purple-500" />
                        <span className="text-sm text-muted-foreground">
                          Total Coupons
                        </span>
                      </div>
                      <span className="text-2xl font-bold">{totalCoupons}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Active Coupons
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-green-500">
                        {activeCoupons}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Admin Actions */}
                  <div className="space-y-2">
                    <Button asChild className="w-full justify-start">
                      <Link
                        href={`/dashboard/admin/coupon-types/edit/${couponType.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Type
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate Type
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(couponType.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{formatDate(couponType.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {couponType.id.substring(0, 8)}...
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount Type</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {couponType.discountType}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={couponType.isActive ? "default" : "secondary"}>
                    {couponType.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}