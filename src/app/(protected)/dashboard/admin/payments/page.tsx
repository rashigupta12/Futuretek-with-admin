"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Download, MoreVertical, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableContainer } from "@/components/admin/TableContainer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Payment = {
  id: string;
  invoiceNumber: string;
  userId: string;
  user?: { name: string; email: string }; // optional — may not exist
  amount: string;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    const invoice = p.invoiceNumber || "";
    const userName = p.user?.name || "";
    const userEmail = p.user?.email || "";
    return (
      invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Payments</h2>
          <p className="text-muted-foreground mt-1">
            View transactions, invoices, and refunds.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading payments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No payments found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                  {/* Invoice */}
                  <td className="px-6 py-4 font-mono text-sm text-foreground">
                    {p.invoiceNumber}
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    {p.user ? (
                      <>
                        <div className="text-sm font-medium text-foreground">
                          {p.user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {p.user.email}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        User ID: {p.userId}
                      </div>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    ₹{Number(p.amount).toLocaleString("en-IN")}
                  </td>

                  {/* Method */}
                  <td className="px-6 py-4 text-sm text-foreground">
                    {p.paymentMethod || "N/A"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        p.status === "PAID" || p.status === "COMPLETED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-0">
                        <Link href={`/dashboard/admin/payments/${p.id}`}>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </Link>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2 text-destructive">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableContainer>
    </div>
  );
}
