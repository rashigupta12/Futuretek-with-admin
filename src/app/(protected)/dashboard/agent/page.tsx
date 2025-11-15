// src/app/(protected)/dashboard/agent/page.tsx
"use client";

import { ArrowRight, Clock, IndianRupee, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  coupons: {
    active: number;
    total: number;
    usedThisMonth: number;
  };
  earnings: {
    total: number;
    thisMonth: number;
    growth: number;
    totalSales: number;
  };
  commissions: {
    pending: {
      amount: number;
      count: number;
    };
    paid: {
      amount: number;
    };
  };
  payouts: {
    total: number;
    count: number;
  };
  agent: {
    commissionRate: number;
    code: string;
  };
  performance: {
    thisMonthSales: number;
    avgCommissionPerSale: number;
  };
}

interface RecentSale {
  id: string;
  studentName: string;
  courseName: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  couponCode?: string;
  timeAgo: string;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch("/api/jyotishi/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecentSales() {
      try {
        setSalesLoading(true);
        const response = await fetch("/api/jyotishi/recent-sales");
        if (response.ok) {
          const data = await response.json();
          setRecentSales(data);
        } else {
          console.error("Failed to fetch recent sales");
        }
      } catch (error) {
        console.error("Failed to fetch recent sales:", error);
      } finally {
        setSalesLoading(false);
      }
    }

    fetchDashboardData();
    fetchRecentSales();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent">
          Agent Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          Track your performance and manage your affiliate business
        </p>
        {stats && (
          <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
            <span className="font-semibold">Agent Code:</span>
            <span className="font-mono">{stats.agent.code}</span>
            <span className="text-gray-400">|</span>
            <span className="font-semibold">Commission Rate:</span>
            <span>{stats.agent.commissionRate}%</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-sm">
              💰
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Earnings</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats?.earnings.total || 0)}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  {stats?.earnings.totalSales} total sales
                </span>
              </div>
            </>
          )}
        </div>

        {/* This Month Earnings */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl shadow-sm">
              📈
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">This Month</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats?.earnings.thisMonth || 0)}
              </p>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stats && stats.earnings.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {stats && stats.earnings.growth >= 0 ? "+" : ""}
                  {stats?.earnings.growth.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </>
          )}
        </div>

        {/* Pending Commissions */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-2xl shadow-sm">
              ⏳
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Commission</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats?.commissions.pending.amount || 0)}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  {stats?.commissions.pending.count} pending
                </span>
              </div>
            </>
          )}
        </div>

        {/* Active Coupons */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-2xl shadow-sm">
              🎟️
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Coupons</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.coupons.active || 0}
              </p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  {stats?.coupons.usedThisMonth} used this month
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Sales Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          <Link 
            href="/dashboard/agent/earnings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {salesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 px-4 rounded-lg border border-gray-100">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Sales Yet</h4>
            <p className="text-gray-500 mb-6">Start sharing your coupons to earn commissions</p>
            <Link 
              href="/dashboard/agent/coupons"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Ticket className="h-4 w-4" />
              View My Coupons
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{sale.studentName}</p>
                    <span className="text-xs text-gray-400">enrolled in</span>
                    <p className="text-sm text-gray-700">{sale.courseName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sale.timeAgo}
                    </span>
                    {sale.couponCode && (
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        {sale.couponCode}
                      </span>
                    )}
                    <span>Sale: {formatCurrency(sale.saleAmount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(sale.commissionAmount)}
                    </p>
                    <p className="text-xs text-gray-500">{sale.commissionRate}% commission</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(sale.status)}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-2xl shadow-sm">
              🎯
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Coupon</h3>
          <p className="text-sm text-gray-600 mb-4">Generate a new coupon code to share with potential students</p>
          <Link 
            href="/dashboard/agent/coupons"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-2xl shadow-sm">
              💸
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Payout</h3>
          <p className="text-sm text-gray-600 mb-4">
            Available: {loading ? "..." : formatCurrency(stats?.commissions.pending.amount || 0)}
          </p>
          <Link 
            href="/dashboard/agent/payouts"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Request Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}