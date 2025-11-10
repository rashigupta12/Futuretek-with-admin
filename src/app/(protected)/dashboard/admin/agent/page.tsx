/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Filter, MoreVertical, ToggleLeft, ToggleRight } from "lucide-react";
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

  const getStatusVariant = (active: boolean) => (active ? "default" : "secondary");

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Jyotishis</h2>
          <p className="text-muted-foreground mt-1">
            Manage astrologers, commissions, and account status.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/agent/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Jyotishi
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading jyotishis...</div>
        ) : filteredJyotishis.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No jyotishis found. Add your first astrologer!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jyotishi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Commission Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJyotishis.map((jyotishi) => (
                  <tr key={jyotishi.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{jyotishi.name}</div>
                      <div className="text-sm text-muted-foreground">{jyotishi.email}</div>
                      {jyotishi.mobile && (
                        <div className="text-xs text-muted-foreground">{jyotishi.mobile}</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(jyotishi.isActive)}>
                        {jyotishi.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {jyotishi.commissionRate}%
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        ₹{jyotishi.stats.totalCommission.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pending: ₹{jyotishi.stats.pendingCommission.toLocaleString("en-IN")}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {jyotishi.stats.totalSales}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(jyotishi.createdAt).toLocaleDateString("en-IN")}
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
                            <Link href={`/dashboard/admin/agent/${jyotishi.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/agent/edit/${jyotishi.id}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-start gap-2 rounded-none ${
                                jyotishi.isActive
                                  ? "text-destructive hover:bg-destructive/10"
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