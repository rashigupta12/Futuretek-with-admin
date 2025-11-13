/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(protected)/dashboard/agent/coupons/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Trash2, Filter, MoreVertical, Copy } from "lucide-react";
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

  // const getStatusVariant = (status: string) => {
  //   switch (status) {
  //     case "ACTIVE": return "default";
  //     case "INACTIVE": return "secondary";
  //     case "EXPIRED": return "destructive";
  //     default: return "outline";
  //   }
  // };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "INACTIVE": return "bg-slate-100 text-slate-700 border-slate-200";
      case "EXPIRED": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-700">My Coupons</h2>
          <p className="text-gray-600 mt-1">
            Create and manage discount coupons for your students.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by code or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

          {/* Create Button */}
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
            <Link href="/dashboard/agent/coupons/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No coupons yet. <Link href="/dashboard/agent/coupons/create" className="text-blue-600 hover:text-blue-700 font-medium underline">Create your first!</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 border-blue-100 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Coupon Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border">
                          {coupon.code}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => copyCode(coupon.code)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {coupon.typeName}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${
                        coupon.discountType === "PERCENTAGE" 
                          ? "text-amber-600" 
                          : "text-blue-600"
                      }`}>
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue.toLocaleString("en-IN")}`}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">{coupon.usageCount}</span>
                        {coupon.maxUsage ? (
                          <span className="text-gray-500"> / {coupon.maxUsage}</span>
                        ) : (
                          <span className="text-gray-400 text-xs ml-1">(unlimited)</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(coupon.status)}`}>
                        {coupon.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {coupon.validUntil
                          ? new Date(coupon.validUntil).toLocaleDateString("en-IN")
                          : "No expiry"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-blue-100 hover:text-blue-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-0 border border-gray-200 shadow-lg">
                          <div className="flex flex-col">
                            <Link href={`/dashboard/agent/coupons/${coupon.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 rounded-none hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/dashboard/agent/coupons/edit/${coupon.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 rounded-none hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-none"
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