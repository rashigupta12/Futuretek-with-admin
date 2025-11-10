/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupon-types/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Tag, Percent, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CouponType = {
  id: string;
  code: string;
  name: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
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
      setTypes(data.types || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = types.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.includes(searchTerm)
  );

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
            placeholder="Search types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading types...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">No types found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {type.code}
                  </span>
                  {type.type === "PERCENTAGE" ? (
                    <Percent className="h-5 w-5 text-green-600" />
                  ) : (
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{type.name}</p>
                <p className="text-sm text-muted-foreground">
                  {type.type === "PERCENTAGE" ? "Percentage Discount" : "Fixed Amount Discount"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}