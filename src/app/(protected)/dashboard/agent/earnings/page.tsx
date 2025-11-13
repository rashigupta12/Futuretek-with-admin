"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Wallet, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

type Commission = {
  id: string;
  courseName: string;
  studentName: string;
  saleAmount: string;
  commissionAmount: string;
  couponCode: string;
  status: "PENDING" | "PAID";
  createdAt: string;
  paidAt: string | null;
};

type Stats = {
  totalEarnings: string;
  pendingEarnings: string;
  paidEarnings: string;
  totalSales: string;
};

export default function EarningsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/jyotishi/earnings");
        const data = await res.json();

        setStats(data.stats);
        setCommissions(data.recentCommissions);
      } catch (err) {
        console.error("Error fetching earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
  }, [session]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    badge,
    gradient,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    gradient: string;
  }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {badge && <p className="text-xs text-gray-500 mt-1">{badge}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Earnings Overview</h1>
        <p className="text-gray-600 mt-1">
          Track commissions earned from students using your coupons.
        </p>
      </div>

      {/* ---- Summary Cards ---- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Earnings"
            value={`₹${Number(stats?.totalEarnings ?? 0).toLocaleString()}`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Pending Earnings"
            value={`₹${Number(stats?.pendingEarnings ?? 0).toLocaleString()}`}
            icon={Clock}
            badge="Awaiting payout"
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            title="Paid Earnings"
            value={`₹${Number(stats?.paidEarnings ?? 0).toLocaleString()}`}
            icon={Wallet}
            badge="Already transferred"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Total Sales"
            value={stats?.totalSales ?? 0}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
        </div>
      )}

      {/* ---- Commission Table ---- */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Recent Commission Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-blue-900 py-4">Course</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Student</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Coupon Code</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4 text-right">Sale Amount</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4 text-right">Commission</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No commissions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((c) => (
                    <TableRow key={c.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                      <TableCell className="font-medium text-gray-900 py-4">
                        {c.courseName}
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {c.studentName}
                      </TableCell>
                      <TableCell className="py-4">
                        <code className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {c.couponCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-right text-gray-900 font-medium py-4">
                        ₹{Number(c.saleAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600 py-4">
                        ₹{Number(c.commissionAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          c.status === "PAID" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 py-4">
                        {format(new Date(c.createdAt), "dd MMM yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}