// src/app/(protected)/dashboard/agent/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Settings,
  LogOut,
  Tag,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  ChevronDown,
  Plus,
  List,
  DollarSign,
  Ticket,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SingleNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  single: true;
};

type GroupNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  key: "coupons" | "earnings";
  subItems: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  single?: false;
};

type NavItem = SingleNavItem | GroupNavItem;

export default function JyotishiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Get user data from session
  const userName = session?.user?.name || "Agent";
  const userImage = session?.user?.image || "/images/user_alt_icon.png";

  // Generate avatar fallback from name
  const getAvatarFallback = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "AG";
  };

  const [expandedMenus, setExpandedMenus] = useState<
    Record<"coupons" | "earnings", boolean>
  >({
    coupons: true,
    earnings: false,
  });

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const toggleMenu = (menu: keyof typeof expandedMenus) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard/agent",
      single: true,
    },
    {
      title: "My Coupons",
      icon: Tag,
      key: "coupons",
      subItems: [
        { title: "All Coupons", href: "/dashboard/agent/coupons", icon: List },
        {
          title: "Create Coupon",
          href: "/dashboard/agent/coupons/create",
          icon: Plus,
        },
        {
          title: "Coupon Types",
          href: "/dashboard/agent/coupon-types",
          icon: Ticket,
        },
      ],
    },
    {
      title: "Earnings",
      icon: TrendingUp,
      key: "earnings",
      subItems: [
        {
          title: "Commission Overview",
          href: "/dashboard/agent/earnings",
          icon: DollarSign,
        },
        {
          title: "Payout History",
          href: "/dashboard/agent/payouts",
          icon: Wallet,
        },
        {
          title: "Request Payout",
          href: "/dashboard/agent/payouts/request",
          icon: Plus,
        },
      ],
    },
    {
    title: "Assign Coupons",
    icon: Users,
    href: "/dashboard/agent/assign-coupons",
    single: true,
  },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/agent/analytics",
      single: true,
    },
    {
      title: "Profile Settings",
      icon: Settings,
      href: "/dashboard/agent/profile",
      single: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 fixed top-0 left-0 right-0 z-50 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FT</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                FutureTek agent
              </h1>
              <p className="text-xs text-gray-500">Affiliate Partner Portal</p>
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
                  
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <Link href="/dashboard/agent/profile">
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4 fixed left-0 top-16 bottom-0 overflow-y-auto mt-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.title}>
                {item.single ? (
                  <Link href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        isActive(item.href)
                          ? "bg-purple-50 text-purple-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center justify-between gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedMenus[item.key] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedMenus[item.key] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((sub) => (
                          <Link key={sub.href} href={sub.href}>
                            <button
                              className={`w-full flex items-center gap-3 rounded-lg p-2 pl-3 transition-colors ${
                                isActive(sub.href)
                                  ? "bg-purple-50 text-purple-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <sub.icon className="h-4 w-4" />
                              <span className="text-sm">{sub.title}</span>
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <h3 className="text-xs font-semibold text-gray-600 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Active Coupons</span>
                <span className="text-sm font-bold text-purple-700">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Students</span>
                <span className="text-sm font-bold text-purple-700">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Pending Earnings</span>
                <span className="text-sm font-bold text-green-600">
                  ₹15,420
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - This is where child pages render */}
        <main className="flex-1 ml-64 mt-4 p-6">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
