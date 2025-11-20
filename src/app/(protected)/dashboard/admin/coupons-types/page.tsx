/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/admin/coupons-types/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Filter, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type CouponType = {
  id: string;
  typeCode: string;
  typeName: string;
  description: string;
  discountType: string;
  maxDiscountLimit: number;
  isActive: boolean;
  createdAt: string;
  stats?: {
    totalCoupons: string;
    activeCoupons: string;
    totalUsage: string;
  };
};

export default function CouponTypesPage() {
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("ALL");

  // Use useCallback to memoize the fetch function
  const fetchCouponTypes = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl =
        discountTypeFilter === "ALL"
          ? "/api/admin/coupon-types"
          : `/api/admin/coupon-types?discountType=${discountTypeFilter}`;

      // Add cache busting parameter
      const cacheBuster = `${baseUrl.includes('?') ? '&' : '?'}_=${new Date().getTime()}`;
      const url = `${baseUrl}${cacheBuster}`;

      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      const data = await res.json();

      const mapped: CouponType[] = (data.couponTypes || []).map((ct: any) => ({
        id: ct.id,
        typeCode: ct.typeCode,
        typeName: ct.typeName,
        description: ct.description || "",
        discountType: ct.discountType,
        maxDiscountLimit: Number(ct.maxDiscountLimit || 0),
        isActive: ct.isActive ?? true,
        createdAt: ct.createdAt,
        stats: ct.stats || {
          totalCoupons: "0",
          activeCoupons: "0",
          totalUsage: "0"
        },
      }));

      setCouponTypes(mapped);
    } catch (err) {
      console.error("Failed to fetch coupon types:", err);
    } finally {
      setLoading(false);
    }
  }, [discountTypeFilter]);

  // Fetch coupon types when component mounts or filter changes
  useEffect(() => {
    fetchCouponTypes();
  }, [fetchCouponTypes]);

  // Filter by search
  const filteredCouponTypes = couponTypes.filter((ct) =>
    ct.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ct.typeCode.includes(searchTerm) ||
    ct.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const discountTypeOptions = [
    "ALL",
    "PERCENTAGE",
    "FIXED_AMOUNT",
  ];

  const getDiscountTypeVariant = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return "default";
      case "FIXED_AMOUNT":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Coupon Types</h2>
          <p className="text-muted-foreground mt-1">
            Manage coupon type templates that agent can use to create individual coupons.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/coupons-types/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Coupon Type
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupon types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={discountTypeFilter} onValueChange={setDiscountTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {discountTypeOptions.map((dt) => (
                  <SelectItem key={dt} value={dt}>
                    {dt === "ALL" ? "All Discount Types" : dt.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading coupon types...</div>
        ) : filteredCouponTypes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm || discountTypeFilter !== "ALL" 
              ? "No coupon types match your search criteria."
              : "No coupon types found. Create your first coupon type!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Discount Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Max Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Coupons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCouponTypes.map((couponType) => (
                  <tr key={couponType.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-foreground font-mono">{couponType.typeCode}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{couponType.typeName}</div>
                      {couponType.description && (
                        <div className="text-sm text-muted-foreground">{couponType.description}</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={getDiscountTypeVariant(couponType.discountType)}>
                        {couponType.discountType.replace(/_/g, " ")}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {couponType.discountType === "PERCENTAGE"
                          ? `${couponType.maxDiscountLimit}%`
                          : `₹${couponType.maxDiscountLimit.toLocaleString("en-IN")}`}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {couponType.stats?.totalCoupons || "0"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {couponType.stats?.activeCoupons || "0"} active
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {couponType.stats?.totalUsage || "0"} times
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={couponType.isActive ? "default" : "secondary"}>
                        {couponType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-0">
                          <div className="flex flex-col">
                            <Link href={`/dashboard/admin/coupons-types/${couponType.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/coupons-types/edit/${couponType.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}