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
  Calendar,
  FileText,
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
        router.push("/dashboard/admin/coupons-types");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!couponType)
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Coupon Type Not Found
          </h2>
          <p className="text-gray-600 mb-6">The requested coupon type could not be found.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/admin/coupons-types">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Coupon Types
            </Link>
          </Button>
        </div>
      </div>
    );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN");

  const totalCoupons = couponType._count?.coupons || 0;
  const activeCoupons =
    couponType.coupons?.filter((c) => c.isActive).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Simplified */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard/admin/coupons-types"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Coupon Types
              </Link>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                ADMIN VIEW
              </Badge>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white shadow-sm">
                  <span className="text-xl font-bold font-mono tracking-wide">
                    {couponType.typeCode}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {couponType.typeName}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {couponType.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Badge
                className={`${
                  couponType.isActive 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-gray-100 text-gray-800 border-gray-200"
                } font-medium`}
              >
                {couponType.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                className={`${
                  couponType.discountType === "PERCENTAGE" 
                    ? "bg-amber-100 text-amber-800 border-amber-200" 
                    : "bg-blue-100 text-blue-800 border-blue-200"
                } font-medium`}
              >
                {couponType.discountType === "PERCENTAGE"
                  ? "Percentage Discount"
                  : "Fixed Amount Discount"}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-medium">
                {totalCoupons} Total Coupons
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">Overview</CardTitle>
                    <CardDescription>
                      Detailed information about this coupon type
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Type Code</label>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <code className="font-mono text-lg font-bold text-blue-900">
                          {couponType.typeCode}
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Max Discount Limit</label>
                      <div className="p-3 bg-amber-50 rounded border border-amber-200">
                        <span className="text-lg font-bold text-amber-900">
                          {couponType.discountType === "PERCENTAGE"
                            ? `${couponType.maxDiscountLimit}%`
                            : `₹${Number(couponType.maxDiscountLimit).toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {couponType.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Code Format */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">Coupon Code Format</CardTitle>
                    <CardDescription>
                      How coupons are generated using this type
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-600 rounded border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-black font-medium">Code Structure</span>
                    </div>
                    <div className="text-white font-mono text-lg font-bold">
                      COUP[JyotishiCode]{couponType.typeCode}
                      {couponType.discountType === "PERCENTAGE"
                        ? "[PercentValue]"
                        : "[AmountValue]"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Example Coupon Codes:</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-white border border-gray-200 rounded">
                        <div className="font-mono text-lg font-bold text-gray-900 mb-1">
                          COUPJD001{couponType.typeCode}
                          {couponType.discountType === "PERCENTAGE" ? "015" : "500"}
                        </div>
                        <p className="text-sm text-gray-600">
                          John Doe&apos;s coupon offering{" "}
                          <span className="font-semibold text-amber-600">
                            {couponType.discountType === "PERCENTAGE"
                              ? "15% discount"
                              : "₹500 discount"}
                          </span>
                        </p>
                      </div>
                      <div className="p-4 bg-white border border-gray-200 rounded">
                        <div className="font-mono text-lg font-bold text-gray-900 mb-1">
                          COUPAS001{couponType.typeCode}
                          {couponType.discountType === "PERCENTAGE" ? "020" : "1000"}
                        </div>
                        <p className="text-sm text-gray-600">
                          Alice Smith&apos;s coupon offering{" "}
                          <span className="font-semibold text-amber-600">
                            {couponType.discountType === "PERCENTAGE"
                              ? "20% discount"
                              : "₹1000 discount"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Coupons */}
            {couponType.coupons && couponType.coupons.length > 0 && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-xl text-gray-900">Recent Coupons</CardTitle>
                      <CardDescription>
                        Latest coupons created using this type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {couponType.coupons.slice(0, 5).map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-gray-900">
                            {coupon.code}
                          </div>
                          <div className="text-sm text-gray-600">
                            By {coupon.createdBy.name} ({coupon.createdBy.jyotishiCode})
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold text-amber-600">
                            {couponType.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`}
                          </div>
                          <div className="text-xs text-gray-500">
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
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">Statistics</CardTitle>
                <CardDescription>Usage metrics for this type</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Total Coupons
                        </span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{totalCoupons}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Active Coupons
                        </span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {activeCoupons}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Admin Actions */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Admin Actions</h4>
                    <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                      <Link
                        href={`/dashboard/admin/coupon-types/edit/${couponType.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Type
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate Type
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Created</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatDate(couponType.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Last Updated</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatDate(couponType.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg text-gray-900">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
                  <span className="text-sm text-gray-700">ID</span>
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                    {couponType.id.substring(0, 8)}...
                  </code>
                </div>
                <div className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
                  <span className="text-sm text-gray-700">Discount Type</span>
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                    {couponType.discountType}
                  </code>
                </div>
                <div className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
                  <span className="text-sm text-gray-700">Status</span>
                  <Badge 
                    className={couponType.isActive 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
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