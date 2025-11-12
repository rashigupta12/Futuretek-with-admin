/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Filter, MoreVertical, ToggleLeft, ToggleRight, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Jyotishi = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    totalSales: number;
  };
};

export default function JyotishisPage() {
  const [jyotishis, setJyotishis] = useState<Jyotishi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "true" | "false">("ALL");

  // Fetch jyotishis
  useEffect(() => {
    fetchJyotishis();
  }, [activeFilter]);

  const fetchJyotishis = async () => {
    try {
      setLoading(true);
      const url =
        activeFilter === "ALL"
          ? "/api/admin/jyotishi"
          : `/api/admin/jyotishi?isActive=${activeFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      const mapped: Jyotishi[] = (data.jyotishis || []).map((j: any) => ({
        id: j.id,
        name: j.name,
        email: j.email,
        mobile: j.mobile,
        commissionRate: Number(j.commissionRate || 0),
        isActive: j.isActive,
        createdAt: j.createdAt,
        stats: {
          totalCommission: j.stats?.totalCommission || 0,
          pendingCommission: j.stats?.pendingCommission || 0,
          paidCommission: j.stats?.paidCommission || 0,
          totalSales: j.stats?.totalSales || 0,
        },
      }));

      setJyotishis(mapped);
    } catch (err) {
      console.error("Failed to fetch jyotishis:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this jyotishi?`)) return;

    try {
      const res = await fetch(`/api/admin/jyotishi/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setJyotishis((prev) =>
          prev.map((j) => (j.id === id ? { ...j, isActive: !currentStatus } : j))
        );
        alert(`Jyotishi ${!currentStatus ? "activated" : "deactivated"} successfully`);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Error updating jyotishi status");
    }
  };

  // Search filter
  const filteredJyotishis = jyotishis.filter((j) => {
    const term = searchTerm.toLowerCase();
    return (
      j.name.toLowerCase().includes(term) ||
      j.email.toLowerCase().includes(term) ||
      (j.mobile && j.mobile.includes(term))
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold bg-blue-700 bg-clip-text text-transparent">
            Jyotishi Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage astrologers, commissions, and account status.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jyotishis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="focus:bg-blue-50">All Status</SelectItem>
              <SelectItem value="true" className="focus:bg-blue-50">Active</SelectItem>
              <SelectItem value="false" className="focus:bg-blue-50">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Jyotishi Button */}
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg whitespace-nowrap">
            <Link href="/dashboard/admin/agent/add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Jyotishi
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview - All cards in single row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Jyotishis</p>
              <p className="text-2xl font-bold text-gray-900">{jyotishis.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{jyotishis.reduce((sum, j) => sum + j.stats.totalCommission, 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {jyotishis.reduce((sum, j) => sum + j.stats.totalSales, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {jyotishis.filter(j => j.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading jyotishis...</p>
          </div>
        ) : filteredJyotishis.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jyotishis found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || activeFilter !== "ALL" 
                ? "Try adjusting your search or filter criteria" 
                : "Add your first jyotishi to get started!"}
            </p>
            {(searchTerm || activeFilter !== "ALL") ? (
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("ALL");
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                Clear Filters
              </Button>
            ) : (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Link href="/dashboard/admin/agent/add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Jyotishi
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
<thead className="bg-blue-500 text-white border-b border-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Jyotishi Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJyotishis.map((jyotishi) => (
                  <tr key={jyotishi.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {jyotishi.name}
                      </div>
                      <div className="text-sm text-gray-600">{jyotishi.email}</div>
                      {jyotishi.mobile && (
                        <div className="text-sm text-gray-500">{jyotishi.mobile}</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        jyotishi.isActive 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}>
                        {jyotishi.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {jyotishi.commissionRate}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{jyotishi.stats.totalCommission.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-amber-600 font-medium">
                        Pending: ₹{jyotishi.stats.pendingCommission.toLocaleString("en-IN")}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {jyotishi.stats.totalSales}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(jyotishi.createdAt).toLocaleDateString("en-IN", {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-2 border border-gray-200 shadow-lg">
                          <div className="flex flex-col space-y-1">
                            <Link href={`/dashboard/admin/agent/${jyotishi.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/agent/edit/${jyotishi.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg hover:bg-amber-50 hover:text-amber-700">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-start gap-2 rounded-lg ${
                                jyotishi.isActive
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => handleToggleActive(jyotishi.id, jyotishi.isActive)}
                            >
                              {jyotishi.isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4" />
                                  Activate
                                </>
                              )}
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