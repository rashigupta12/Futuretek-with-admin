"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Wallet, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {badge && <p className="text-xs text-muted-foreground">{badge}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings Overview</h1>
        <p className="text-muted-foreground">
          Track commissions earned from students using your coupons.
        </p>
      </div>

      {/* ---- Summary Cards ---- */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Earnings"
            value={`₹${Number(stats?.totalEarnings ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Pending Earnings"
            value={`₹${Number(stats?.pendingEarnings ?? 0).toLocaleString()}`}
            icon={Clock}
            badge="Awaiting payout"
          />
          <StatCard
            title="Paid Earnings"
            value={`₹${Number(stats?.paidEarnings ?? 0).toLocaleString()}`}
            icon={Wallet}
            badge="Already transferred"
          />
          <StatCard
            title="Total Sales"
            value={stats?.totalSales ?? 0}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* ---- Commission Table ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commission Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead className="text-right">Sale Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No commissions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.courseName}</TableCell>
                      <TableCell>{c.studentName}</TableCell>
                      <TableCell>{c.couponCode}</TableCell>
                      <TableCell className="text-right">
                        ₹{Number(c.saleAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{Number(c.commissionAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.status === "PAID" ? "default" : "secondary"}
                          className={
                            c.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
