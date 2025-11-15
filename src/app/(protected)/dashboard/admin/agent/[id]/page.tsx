"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Mail,
  Phone,
  Save,
  User,
  UserCheck,
  UserX,
  Wallet,
  X,
  Eye,
  Trash2,
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
  bio?: string | null;
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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    commissionRate: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankAccountHolderName: "",
    panNumber: "",
    bio: "",
  });

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

      // Initialize form data
      if (data.jyotishi) {
        setFormData({
          name: data.jyotishi.name || "",
          email: data.jyotishi.email || "",
          mobile: data.jyotishi.mobile || "",
          commissionRate: data.jyotishi.commissionRate?.toString() || "",
          bankAccountNumber: data.jyotishi.bankAccountNumber || "",
          bankIfscCode: data.jyotishi.bankIfscCode || "",
          bankAccountHolderName: data.jyotishi.bankAccountHolderName || "",
          panNumber: data.jyotishi.panNumber || "",
          bio: data.jyotishi.bio || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 const handleEditToggle = () => {
  if (isEditing) {
    // Show confirmation if user cancels with unsaved changes
    const hasChanges = JSON.stringify({
      name: jyotishi?.name || "",
      email: jyotishi?.email || "",
      mobile: jyotishi?.mobile || "",
      commissionRate: jyotishi?.commissionRate?.toString() || "",
      bankAccountNumber: jyotishi?.bankAccountNumber || "",
      bankIfscCode: jyotishi?.bankIfscCode || "",
      bankAccountHolderName: jyotishi?.bankAccountHolderName || "",
      panNumber: jyotishi?.panNumber || "",
      bio: jyotishi?.bio || "",
    }) !== JSON.stringify(formData);

    if (hasChanges) {
      Swal.fire({
        title: 'Discard Changes?',
        text: "You have unsaved changes that will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, discard!',
        cancelButtonText: 'Continue editing'
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset form data when canceling edit
          if (jyotishi) {
            setFormData({
              name: jyotishi.name || "",
              email: jyotishi.email || "",
              mobile: jyotishi.mobile || "",
              commissionRate: jyotishi.commissionRate?.toString() || "",
              bankAccountNumber: jyotishi.bankAccountNumber || "",
              bankIfscCode: jyotishi.bankIfscCode || "",
              bankAccountHolderName: jyotishi.bankAccountHolderName || "",
              panNumber: jyotishi.panNumber || "",
              bio: jyotishi.bio || "",
            });
          }
          setIsEditing(false);
        }
      });
      return;
    }
  }
  setIsEditing(!isEditing);
};

 const handleSave = async () => {
  if (!jyotishi) return;

  setSaving(true);
  try {
    const payload = {
      ...formData,
      commissionRate: Number(formData.commissionRate),
      mobile: formData.mobile || null,
      bankAccountNumber: formData.bankAccountNumber || null,
      bankIfscCode: formData.bankIfscCode || null,
      bankAccountHolderName: formData.bankAccountHolderName || null,
      panNumber: formData.panNumber || null,
      bio: formData.bio || null,
    };

    const res = await fetch(`/api/admin/jyotishi/${jyotishi.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updatedData = await res.json();
      setJyotishi(updatedData.jyotishi);
      setIsEditing(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Jyotishi updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      const error = await res.json();
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.error || 'Failed to update jyotishi',
      });
    }
  } catch (err) {
    console.error("Update error:", err);
    Swal.fire({
      icon: 'error',
      title: 'Unexpected Error!',
      text: 'An unexpected error occurred while updating jyotishi',
    });
  } finally {
    setSaving(false);
  }
};

 const handleDeactivate = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You want to deactivate this Jyotishi?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, deactivate!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/admin/jyotishi/${params.id}`, {
      method: "DELETE",
    });
    
    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Deactivated!',
        text: 'Jyotishi deactivated successfully',
      });
      router.push("/dashboard/admin/agent");
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to deactivate jyotishi',
      });
    }
  } catch {
    await Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Error deactivating Jyotishi',
    });
  }
};


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!jyotishi) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Jyotishi Not Found
        </h2>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="relative py-8 mb-8 bg-gradient-to-r from-blue-50 to-amber-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/admin/agent"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Jyotishis
                </Link>
                <Badge variant="outline" className="text-xs bg-white">
                  ADMIN VIEW
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {jyotishi.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Jyotishi Name"
                      className="font-bold border-blue-300 focus:border-blue-500 h-16 text-2xl"
                    />
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Email Address"
                      className="text-lg border-blue-300 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {jyotishi.name}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {jyotishi.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge
                variant={jyotishi.isActive ? "default" : "secondary"}
                className={
                  jyotishi.isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
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
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
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
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-700">
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{jyotishi.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-sm text-gray-700">
                      Mobile
                    </Label>
                    {isEditing ? (
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) =>
                          handleInputChange("mobile", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">
                          {jyotishi.mobile || "Not provided"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-700">
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{jyotishi.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Joined On</Label>
                    <div className="flex items-center gap-3 p-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <p className="font-medium">
                        {formatDate(jyotishi.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label
                      htmlFor="commissionRate"
                      className="text-sm text-gray-700"
                    >
                      Commission Rate (%)
                    </Label>
                    {isEditing ? (
                      <Input
                        id="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.commissionRate}
                        onChange={(e) =>
                          handleInputChange("commissionRate", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-lg text-amber-600">
                        {jyotishi.commissionRate}%
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="bio" className="text-sm text-gray-700">
                      Bio / Introduction
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        className="border-gray-300 focus:border-blue-500"
                        placeholder="Brief introduction about the jyotishi, expertise, and experience..."
                      />
                    ) : (
                      <p className="font-medium text-gray-700">
                        {jyotishi.bio || "No bio provided"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            {(jyotishi.bankAccountNumber ||
              jyotishi.panNumber ||
              isEditing) && (
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Bank & Tax Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {(isEditing || jyotishi.bankAccountHolderName) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="bankAccountHolderName"
                          className="text-sm text-gray-700"
                        >
                          Account Holder Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="bankAccountHolderName"
                            value={formData.bankAccountHolderName}
                            onChange={(e) =>
                              handleInputChange(
                                "bankAccountHolderName",
                                e.target.value
                              )
                            }
                            className="border-gray-300 focus:border-amber-500"
                          />
                        ) : (
                          <p className="font-medium">
                            {jyotishi.bankAccountHolderName}
                          </p>
                        )}
                      </div>
                    )}

                    {(isEditing || jyotishi.bankAccountNumber) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="bankAccountNumber"
                          className="text-sm text-gray-700"
                        >
                          Bank Account Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={(e) =>
                              handleInputChange(
                                "bankAccountNumber",
                                e.target.value
                              )
                            }
                            className="border-gray-300 focus:border-amber-500 font-mono"
                          />
                        ) : (
                          <code className="bg-amber-50 px-3 py-2 rounded border font-mono text-sm block">
                            {jyotishi.bankAccountNumber}
                          </code>
                        )}
                      </div>
                    )}

                    {(isEditing || jyotishi.bankIfscCode) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="bankIfscCode"
                          className="text-sm text-gray-700"
                        >
                          IFSC Code
                        </Label>
                        {isEditing ? (
                          <Input
                            id="bankIfscCode"
                            value={formData.bankIfscCode}
                            onChange={(e) =>
                              handleInputChange(
                                "bankIfscCode",
                                e.target.value.toUpperCase()
                              )
                            }
                            className="border-gray-300 focus:border-amber-500 font-mono uppercase"
                          />
                        ) : (
                          <code className="bg-amber-50 px-3 py-2 rounded border font-mono text-sm block">
                            {jyotishi.bankIfscCode}
                          </code>
                        )}
                      </div>
                    )}

                    {(isEditing || jyotishi.panNumber) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="panNumber"
                          className="text-sm text-gray-700"
                        >
                          PAN Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="panNumber"
                            value={formData.panNumber}
                            onChange={(e) =>
                              handleInputChange(
                                "panNumber",
                                e.target.value.toUpperCase()
                              )
                            }
                            className="border-gray-300 focus:border-amber-500 font-mono uppercase"
                          />
                        ) : (
                          <code className="bg-amber-50 px-3 py-2 rounded border font-mono text-sm block">
                            {jyotishi.panNumber}
                          </code>
                        )}
                      </div>
                    )}

                    {isEditing &&
                      !jyotishi.bankAccountNumber &&
                      !jyotishi.panNumber && (
                        <div className="sm:col-span-2 text-center py-4">
                          <p className="text-sm text-amber-600">
                            No banking details added yet. Fill in the
                            information above.
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Commissions */}
            {recentCommissions.length > 0 && (
              <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                  <CardTitle>Recent Commissions</CardTitle>
                  <CardDescription>
                    Last {recentCommissions.length} transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-gray-700">Date</TableHead>
                          <TableHead className="text-gray-700">
                            Course
                          </TableHead>
                          <TableHead className="text-gray-700">
                            Student
                          </TableHead>
                          <TableHead className="text-gray-700">Sale</TableHead>
                          <TableHead className="text-gray-700">
                            Commission
                          </TableHead>
                          <TableHead className="text-gray-700">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentCommissions.map((comm) => (
                          <TableRow key={comm.id} className="hover:bg-gray-50">
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
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-amber-100 text-amber-800 border-amber-200"
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
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-xl">Commission Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Earned</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(stats?.totalCommission || 0)}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Pending
                      </p>
                      <p className="font-semibold text-amber-600">
                        {formatCurrency(stats?.pendingCommission || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Paid
                      </p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(stats?.paidCommission || 0)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-medium text-gray-900">
                      {stats?.totalSales || 0}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Banknote className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">
                      {jyotishi.commissionRate}%
                    </p>
                    <p className="text-sm text-amber-700">Commission Rate</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {/* Actions */}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href={`/jyotishi/${jyotishi.id}`} target="_blank">
                      <Eye className="h-2 w-2 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleEditToggle}
                      className="bg-blue-600 hover:bg-blue-700 w-full justify-start"
                    >
                      <Edit className="h-2 w-2 mr-1" />
                      Edit Jyotishi
                    </Button>
                  )}
                </div>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleDeactivate}
                  disabled={!jyotishi.isActive}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>

                <p className="text-xs text-gray-500 text-center italic">
                  Last updated: {formatDate(jyotishi.createdAt)}
                </p>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-50">
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-[120px]">
                    {jyotishi.id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant={jyotishi.isActive ? "default" : "secondary"}
                    className={
                      jyotishi.isActive
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {jyotishi.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
