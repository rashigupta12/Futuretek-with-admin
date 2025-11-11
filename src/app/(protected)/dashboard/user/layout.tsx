// src/app/(protected)/dashboard/user/layout.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  Home,
  IndianRupee,
  LogOut,
  Settings,
  Wallet
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type SingleNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  single: true;
};

type NavItem = SingleNavItem;

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Student";
  const userImage = session?.user?.image || "/images/user_alt_icon.png";

  const getAvatarFallback = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "ST";
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard/user",
      single: true,
    },
    {
      title: "My Courses",
      icon: BookOpen,
      href: "/dashboard/user/courses",
      single: true,
    },
    {
      title: "Payments",
      icon: Wallet,
      href: "/dashboard/user/payments",
      single: true,
    },
    {
      title: "Profile",
      icon: Settings,
      href: "/dashboard/user/profile",
      single: true,
    },
  ];

  // Mock stats – replace with real API in child pages
  const quickStats = {
    enrolledCourses: 5,
    totalSpent: 12499,
    activeCourses: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FT</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                FutureTek Student
              </h1>
              <p className="text-xs text-gray-500">Learning Portal</p>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-700 block">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-500 block">Student</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <Link href="/dashboard/user/profile">
                  <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <div className="flex pt-4">
        {/* Sidebar */}
        <aside className="w-64 pt-6 bg-white border-r min-h-[calc(100vh-64px)] p-4 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.title}</span>
                </button>
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Learning Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs text-gray-600">Enrolled Courses</span>
                </div>
                <span className="text-sm font-bold text-indigo-700">
                  {quickStats.enrolledCourses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600">Active Now</span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {quickStats.activeCourses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">Total Spent</span>
                </div>
                <span className="text-sm font-bold text-purple-700">
                  ₹{quickStats.totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 pt-4 px-6 pb-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}