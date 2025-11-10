/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Trash2, Filter, MoreVertical, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Coupon = {
  id: string;
  code: string;
  typeName: string;
  discountValue: number;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  usageCount: number;
  maxUsage: number | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  validUntil: string | null;
  createdAt: string;
};

export default function MyCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "ALL"
          ? "/api/jyotishi/coupons"
          : `/api/jyotishi/coupons?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      const mapped: Coupon[] = (data.coupons || []).map((c: any) => {
        const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
        const isActive = c.isActive && !isExpired;

        return {
          id: c.id,
          code: c.code,
          typeName: c.typeName,
          discountValue: Number(c.discountValue),
          discountType: c.discountType,
          usageCount: c.currentUsageCount || 0,
          maxUsage: c.maxUsageCount,
          status: isActive ? "ACTIVE" : isExpired ? "EXPIRED" : "INACTIVE",
          validUntil: c.validUntil,
          createdAt: c.createdAt,
        };
      });

      setCoupons(mapped);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/jyotishi/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete coupon");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting coupon");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.typeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default";
      case "INACTIVE": return "secondary";
      case "EXPIRED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Coupons</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons for your students.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agent/coupons/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No coupons yet. <Link href="/dashboard/agent/coupons/create" className="text-primary underline">Create your first!</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold text-foreground">
                          {coupon.code}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {coupon.typeName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue.toLocaleString("en-IN")}`}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {coupon.usageCount}{" "}
                      {coupon.maxUsage ? `/ ${coupon.maxUsage}` : ""}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(coupon.status)}>
                        {coupon.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {coupon.validUntil
                        ? new Date(coupon.validUntil).toLocaleDateString("en-IN")
                        : "No expiry"}
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
                            <Link href={`/dashboard/agent/coupons/${coupon.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 rounded-none"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/dashboard/agent/coupons/edit/${coupon.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 rounded-none"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 rounded-none"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
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