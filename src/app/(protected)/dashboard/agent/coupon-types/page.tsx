/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupon-types/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Tag, Percent, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CouponType = {
  id: string;
  typeCode: string;
  typeName: string;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  description: string;
  maxDiscountLimit: string;
  isActive: boolean;
  createdAt: string;
};

export default function CouponTypesPage() {
  const [types, setTypes] = useState<CouponType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/jyotishi/coupon-types");
      const data = await res.json();
      setTypes(data.couponTypes || []);
    } catch (err) {
      console.error("Error fetching coupon types:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = types.filter((t) => {
    const name = t.typeName || "";
    const code = t.typeCode || "";
    const desc = t.description || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Available Coupon Types</h2>
        <p className="text-muted-foreground mt-1">
          These are admin-defined templates you can use to create coupons.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupon types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted-foreground">Loading types...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">No coupon types found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {type.typeCode}
                  </span>
                  {type.discountType === "PERCENTAGE" ? (
                    <Percent className="h-5 w-5 text-green-600" />
                  ) : (
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-foreground">{type.typeName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {type.discountType === "PERCENTAGE"
                    ? "Percentage Discount"
                    : "Fixed Amount Discount"}
                </p>

                {type.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {type.description}
                  </p>
                )}

                <p className="text-sm font-medium mt-2">
                  Max Limit: ₹{Number(type.maxDiscountLimit).toLocaleString("en-IN")}
                </p>

                <p
                  className={`text-sm mt-2 ${
                    type.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {type.isActive ? "Active" : "Inactive"}
                </p>

                <p className="text-xs text-muted-foreground mt-2">
                  Created on:{" "}
                  {new Date(type.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
