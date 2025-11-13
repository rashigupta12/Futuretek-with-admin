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
    <div className=" w-full mx-auto">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">Available Coupon Types</h2>
          <p className="text-gray-600 mt-1">
            These are admin-defined templates you can use to create coupons.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search coupon types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading types...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No coupon types found</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => (
            <Card 
              key={type.id} 
              className="hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-200 bg-white"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold">{type.typeCode}</span>
                  </span>
                  {type.discountType === "PERCENTAGE" ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <Percent className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-white" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <p className="text-lg font-bold text-gray-900">{type.typeName}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    type.discountType === "PERCENTAGE"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    {type.discountType === "PERCENTAGE"
                      ? "Percentage Discount"
                      : "Fixed Amount Discount"}
                  </span>
                </div>

                {type.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {type.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Max Limit: <span className="text-blue-600">₹{Number(type.maxDiscountLimit).toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                  
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      type.isActive 
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                        : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created on:{" "}
                    {new Date(type.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}