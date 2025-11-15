/*eslint-disable  @typescript-eslint/no-explicit-any*/
"use client";

import { TableContainer } from "@/components/admin/TableContainer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Payment = {
  id: string;
  invoiceNumber: string;
  userId: string;
  user: { name: string; email: string };
  amount: string;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchPaymentsWithUsers = async () => {
      try {
        setLoading(true);

        // Fetch both payments and users
        const [paymentsRes, usersRes] = await Promise.all([
          fetch("/api/admin/payments"),
          fetch("/api/admin/users"),
        ]);

        const [paymentsData, usersData] = await Promise.all([
          paymentsRes.json(),
          usersRes.json(),
        ]);

        const allPayments = paymentsData.payments || [];
        const allUsers = usersData.users || [];

        // Create a user map for quick lookup
        const userMap = new Map<string, User>();
        allUsers.forEach((u: User) => {
          userMap.set(u.id, { id: u.id, name: u.name, email: u.email });
        });

        // Map payments and attach user details
        const mappedPayments = allPayments
          .map((p: any) => {
            const user = userMap.get(p.userId) || {
              name: "Unknown User",
              email: "N/A",
            };

            return {
              id: p.id,
              invoiceNumber: p.invoiceNumber,
              userId: p.userId,
              user: {
                name: user.name,
                email: user.email,
              },
              amount: p.finalAmount || p.amount || "0",
              paymentMethod: p.paymentMethod,
              status: p.status,
              createdAt: p.createdAt,
            };
          });

        setPayments(mappedPayments);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsWithUsers();
  }, []);

  const filtered = payments.filter((p) => {
    const invoice = p.invoiceNumber || "";
    const userName = p.user?.name || "";
    const userEmail = p.user?.email || "";
    
    // Search filter
    const searchMatch = 
      invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter - map "PENDING" to "FAILED" for filtering
    let statusToFilter = p.status;
    if (p.status === "PENDING") {
      statusToFilter = "FAILED";
    }
    
    const statusMatch = statusFilter === "all" || statusToFilter === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Helper function to get display status and badge style
  const getDisplayStatus = (status: string) => {
    if (status === "PENDING") {
      return {
        displayText: "FAILED",
        className: "bg-red-100 text-red-800"
      };
    }
    return {
      displayText: status,
      className: status === "COMPLETED" 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    };
  };

  return (
    <div className="p-2 w-full mx-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
            <p className="text-gray-600 mt-1">
              Manage and view all payment transactions ({filtered.length} payments)
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-0 focus:ring-0">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <TableContainer>
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading payments...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No payments found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-700 border-b border-gray-200 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((p) => {
                      const statusInfo = getDisplayStatus(p.status);
                      return (
                        <tr 
                          key={p.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Invoice */}
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-900 font-medium">
                              {p.invoiceNumber}
                            </span>
                          </td>

                          {/* User */}
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/admin/users/${p.userId}`}
                              className="block hover:underline"
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {p.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {p.user.email}
                              </div>
                            </Link>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </td>

                          {/* Method */}
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {p.paymentMethod || "Online"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <Badge className={`${statusInfo.className} font-medium`}>
                              {statusInfo.displayText}
                            </Badge>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(p.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TableContainer>
        </div>

        {/* Summary Footer */}
        {filtered.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filtered.length} of {payments.length} payments
          </div>
        )}
      </div>
    </div>
  );
}