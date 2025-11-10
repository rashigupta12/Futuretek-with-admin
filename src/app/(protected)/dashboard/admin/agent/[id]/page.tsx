"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  Phone,
  User,
  UserCheck,
  UserX,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Jyotishi = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  commissionRate: number;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankAccountHolderName?: string | null;
  panNumber?: string | null;
  isActive: boolean;
  createdAt: string;
};

type CommissionStats = {
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  totalSales: number;
};

type RecentCommission = {
  id: string;
  saleAmount: number;
  commissionAmount: number;
  status: "PENDING" | "PAID";
  createdAt: string;
  courseName?: string | null;
  studentName?: string | null;
};

export default function ViewJyotishiPage() {
  const params = useParams();
  const router = useRouter();
  const [jyotishi, setJyotishi] = useState<Jyotishi | null>(null);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [recentCommissions, setRecentCommissions] = useState<
    RecentCommission[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchJyotishi();
  }, [params.id]);

  const fetchJyotishi = async () => {
    try {
      const res = await fetch(`/api/admin/jyotishi/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      setJyotishi(data.jyotishi);
      setStats(data.stats);
      setRecentCommissions(data.recentCommissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this Jyotishi?")) return;
    try {
      const res = await fetch(`/api/admin/jyotishi/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Jyotishi deactivated successfully");
        router.push("/dashboard/admin/agent");
      } else {
        alert("Failed to deactivate");
      }
    } catch {
      alert("Error deactivating Jyotishi");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!jyotishi) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Jyotishi Not Found
        </h2>
        <Button asChild>
          <Link href="/dashboard/admin/agent">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jyotishi List
          </Link>
        </Button>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/admin/agent"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Jyotishi
              </Link>
              <Badge variant="outline" className="text-xs">
                ADMIN VIEW
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {jyotishi.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  {jyotishi.name}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {jyotishi.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Badge
                variant={jyotishi.isActive ? "default" : "secondary"}
                className={
                  jyotishi.isActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }
              >
                {jyotishi.isActive ? (
                  <>
                    <UserCheck className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <UserX className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              <Badge variant="secondary">
                Commission: {jyotishi.commissionRate}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{jyotishi.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                      <p className="font-medium">{jyotishi.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{jyotishi.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined On</p>
                      <p className="font-medium">
                        {formatDate(jyotishi.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            {(jyotishi.bankAccountNumber || jyotishi.panNumber) && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    Bank & Tax Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    {jyotishi.bankAccountHolderName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Holder
                        </span>
                        <span className="font-medium">
                          {jyotishi.bankAccountHolderName}
                        </span>
                      </div>
                    )}
                    {jyotishi.bankAccountNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Number
                        </span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {jyotishi.bankAccountNumber}
                        </code>
                      </div>
                    )}
                    {jyotishi.bankIfscCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IFSC Code</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {jyotishi.bankIfscCode}
                        </code>
                      </div>
                    )}
                    {jyotishi.panNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PAN</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {jyotishi.panNumber}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Commissions */}
            {recentCommissions.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">Recent Commissions</CardTitle>
                  <CardDescription>
                    Last {recentCommissions.length} transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Sale</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentCommissions.map((comm) => (
                          <TableRow key={comm.id}>
                            <TableCell className="text-xs">
                              {formatDate(comm.createdAt)}
                            </TableCell>
                            <TableCell className="font-medium max-w-[150px] truncate">
                              {comm.courseName || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {comm.studentName || "—"}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(comm.saleAmount)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(comm.commissionAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  comm.status === "PAID"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  comm.status === "PAID"
                                    ? "bg-green-500 text-white"
                                    : "bg-yellow-500 text-white"
                                }
                              >
                                {comm.status === "PAID" ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {comm.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Commission Summary */}
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">Commission Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      {formatCurrency(stats?.totalCommission || 0)}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Pending
                      </p>
                      <p className="font-semibold text-yellow-600">
                        {formatCurrency(stats?.pendingCommission || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Paid
                      </p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(stats?.paidCommission || 0)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Sales</span>
                    <span className="font-medium">
                      {stats?.totalSales || 0}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Admin Actions */}
                <div className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href={`/jyotishi/${jyotishi.id}`} target="_blank">
                      <User className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href={`/dashboard/admin/agent/edit/${jyotishi.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Jyotishi
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleDeactivate}
                    disabled={!jyotishi.isActive}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate Account
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center italic">
                  Last updated: {formatDate(jyotishi.createdAt)}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Commission Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {jyotishi.commissionRate}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  of every successful course sale
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
