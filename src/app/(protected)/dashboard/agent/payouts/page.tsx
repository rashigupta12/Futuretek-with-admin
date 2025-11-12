// src/app/(protected)/dashboard/agent/payouts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Wallet, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type Payout = {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  processedAt?: string;
  reason?: string;
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch("/api/jyotishi/payouts");
        const data = await res.json();
        setPayouts(data.payouts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  const getStatusIcon = (status: Payout["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "APPROVED":
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-rose-500" />;
    }
  };

  const getStatusColor = (status: Payout["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
  };

  // Calculate stats
  const stats = {
    totalPayouts: payouts.length,
    totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0),
    pendingPayouts: payouts.filter(p => p.status === "PENDING").length,
    paidAmount: payouts.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6 p-4 w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payout History</h1>
        <p className="text-gray-600 mt-1">
          View all payout requests and their current status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Payouts</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPayouts}</div>
            <p className="text-xs text-gray-500 mt-1">All time requests</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Amount</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Total requested</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingPayouts}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Paid Out</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{stats.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            Payout Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-blue-900 py-4">Request ID</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Amount</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Requested On</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Processed On</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-blue-900 py-4">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No payout requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                      <TableCell className="font-mono text-sm text-gray-900 py-4">
                        #{p.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 py-4">
                        ₹{p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {format(new Date(p.requestedAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-700 py-4">
                        {p.processedAt
                          ? format(new Date(p.processedAt), "dd MMM yyyy")
                          : <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                          {getStatusIcon(p.status)}
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        {p.reason || <span className="text-gray-400">—</span>}
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