// src/app/(protected)/dashboard/user/layout.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";

import { BookOpen, CheckCircle, IndianRupee } from "lucide-react";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-learning-summary"],
    queryFn: async () => {
      const res = await fetch("/api/user/learning-summary");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 60_000,
  });

  return (
    <DashboardLayout role="user">
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Learning Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {isLoading ? "..." : stats?.enrolledCourses || 0}
            </p>
            <p className="text-sm text-gray-600">Enrolled</p>
          </div>
          <div className="text-center">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {isLoading ? "..." : stats?.activeCourses || 0}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <IndianRupee className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              ₹{isLoading ? "..." : (stats?.totalSpent || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>
      {children}
    </DashboardLayout>
  );
}