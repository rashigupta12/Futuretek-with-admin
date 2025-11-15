/*eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/admin/coupons/page.tsx
"use client";

import {
  ArrowLeft,
  Calendar,
  Copy,
  Filter,
  IndianRupee,
  Percent,
  Plus,
  Power,
  PowerOff,
  Search,
  Tag,
  Trash2,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  maxUsageCount?: number;
  currentUsageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  couponScope: "GENERAL" | "PERSONAL";
  description?: string;
  createdAt: string;
  typeName: string;
  typeCode: string;
  createdBy?: string;
  createdByEmail?: string;
}

export default function AllCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/coupons");
      
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      } else {
        console.error("Failed to fetch coupons");
        await Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: 'Failed to load coupons',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load coupons',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this coupon? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setDeleteLoading(couponId);
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCoupons(coupons.filter(coupon => coupon.id !== couponId));
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Coupon deleted successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error instanceof Error ? error.message : 'Failed to delete coupon',
        confirmButtonColor: '#d33',
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${action} this coupon?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#f59e0b' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      setToggleLoading(couponId);
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(coupons.map(coupon =>
          coupon.id === couponId
            ? { ...coupon, isActive: !currentStatus }
            : coupon
        ));
        await Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: data.message || `Coupon ${action}d successfully`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} coupon`);
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error instanceof Error ? error.message : `Failed to ${action} coupon`,
        confirmButtonColor: '#d33',
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      await Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Coupon code copied to clipboard',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Copy Failed',
        text: 'Failed to copy coupon code',
        confirmButtonColor: '#d33',
      });
    }
  };

  const getStatusBadge = (isActive: boolean, validUntil: string) => {
    const now = new Date();
    const validUntilDate = new Date(validUntil);

    if (!isActive) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Inactive</span>;
    }

    if (validUntilDate < now) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Expired</span>;
    }

    return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>;
  };

  const getScopeBadge = (scope: "GENERAL" | "PERSONAL") => {
    return scope === "GENERAL" 
      ? <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">General</span>
      : <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Personal</span>;
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    return coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}%`
      : `₹${coupon.discountValue}`;
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.maxUsageCount) return 0;
    return (coupon.currentUsageCount / coupon.maxUsageCount) * 100;
  };

  // Filter coupons based on search and filters
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && coupon.isActive && new Date(coupon.validUntil) > new Date()) ||
                         (statusFilter === "inactive" && !coupon.isActive) ||
                         (statusFilter === "expired" && new Date(coupon.validUntil) < new Date());

    const matchesScope = scopeFilter === "all" || coupon.couponScope === scopeFilter;

    return matchesSearch && matchesStatus && matchesScope;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">FT</span>
          </div>
          <p className="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Coupons</h1>
            <p className="text-gray-600">Manage and track all coupon codes</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/coupons/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Coupon
        </button>
      </div>

     <div className="flex flex-col gap-6">

  {/* Row: Stats Cards + Filters */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Tag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Coupons</p>
            <p className="text-2xl font-bold">{coupons.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Coupons</p>
            <p className="text-2xl font-bold">
              {coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date()).length}
            </p>
          </div>
        </div>
      </div>

      {/* Add other stat cards here (if any) */}
    </div>

    {/* Filters (Right Side) */}
    <div className="bg-white rounded-lg border p-6 md:w-auto">
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        {/* Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>{filteredCoupons.length} found</span>
        </div>

      </div>
    </div>

  </div>
</div>


      {/* Coupons Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600 mb-4">
              {coupons.length === 0 
                ? "Get started by creating your first coupon."
                : "No coupons match your search criteria."}
            </p>
            {coupons.length === 0 && (
              <button
                onClick={() => router.push("/dashboard/admin/coupons/add")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono font-bold text-gray-900 text-sm">
                              {coupon.code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy coupon code"
                            >
                              <Copy className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">{coupon.typeName}</span>
                            {/* {getScopeBadge(coupon.couponScope)} */}
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                          {coupon.createdBy && (
                            <p className="text-xs text-gray-400">
                              Created by: {coupon.createdBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <IndianRupee className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-semibold text-gray-900">
                          {getDiscountDisplay(coupon)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Used</span>
                          <span className="font-medium">
                            {coupon.currentUsageCount}
                            {coupon.maxUsageCount && ` / ${coupon.maxUsageCount}`}
                          </span>
                        </div>
                        {coupon.maxUsageCount && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(getUsagePercentage(coupon), 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(coupon.validFrom).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(coupon.isActive, coupon.validUntil)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* <button
                          onClick={() => router.push(`/dashboard/admin/coupons/${coupon.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button> */}
                        {/* <button
                          onClick={() => router.push(`/dashboard/admin/coupons/${coupon.id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit coupon"
                        >
                          <Edit className="h-4 w-4" />
                        </button> */}
                        <button
                          onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                          disabled={toggleLoading === coupon.id}
                          className={`p-2 rounded-lg transition-colors ${
                            coupon.isActive
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          } disabled:opacity-50`}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {toggleLoading === coupon.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : coupon.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={deleteLoading === coupon.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete coupon"
                        >
                          {deleteLoading === coupon.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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