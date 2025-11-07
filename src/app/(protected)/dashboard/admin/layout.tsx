// Create a NEW layout specifically for admin routes
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  Home,
  Settings,
  Users,
  BarChart3,
  LogOut,
  FileText,
  Tag,
  CreditCard,
  Award,
  Globe,
  ChevronDown,
  Plus,
  List,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SingleNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  single: true;
};

type GroupNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  key: "courses" | "blogs" | "coupons" | "certificates";
  subItems: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  single?: false;
};

type NavItem = SingleNavItem | GroupNavItem;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [expandedMenus, setExpandedMenus] = useState<
    Record<"courses" | "blogs" | "coupons" | "certificates", boolean>
  >({
    courses: true,
    blogs: false,
    coupons: false,
    certificates: false,
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
      href: "/dashboard/admin",
      single: true,
    },
    {
      title: "Courses",
      icon: BookOpen,
      key: "courses",
      subItems: [
        { title: "All Courses", href: "/dashboard/admin/courses", icon: List },
        {
          title: "Add Course",
          href: "/dashboard/admin/courses/add",
          icon: Plus,
        },
      ],
    },
    {
      title: "Blogs",
      icon: FileText,
      key: "blogs",
      subItems: [
        { title: "All Blogs", href: "/dashboard/admin/blogs", icon: List },
        { title: "Add Blog", href: "/dashboard/admin/blogs/add", icon: Plus },
      ],
    },
    {
      title: "Users",
      icon: Users,
      href: "/dashboard/admin/users",
      single: true,
    },
    {
      title: "Coupons",
      icon: Tag,
      key: "coupons",
      subItems: [
        {
          title: "All Coupons",
          href: "/dashboard/admin/coupons",
          icon: List,
        },
        {
          title: "Add Coupon",
          href: "/dashboard/admin/coupons/add",
          icon: Plus,
        },
      ],
    },
    {
      title: "Payments",
      icon: CreditCard,
      href: "/dashboard/admin/payments",
      single: true,
    },
    {
      title: "Certificates",
      icon: Award,
      key: "certificates",
      subItems: [
        {
          title: "Requests",
          href: "/dashboard/admin/certificates/requests",
          icon: List,
        },
        {
          title: "All Certificates",
          href: "/dashboard/admin/certificates",
          icon: Award,
        },
      ],
    },
    {
      title: "Website Content",
      icon: Globe,
      href: "/dashboard/admin/website-content",
      single: true,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      single: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FT</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              FutureTek Admin
            </h1>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  Admin User
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
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

      <div className="flex ">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.title}>
                {item.single ? (
                  <Link href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 font-medium"
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
                                  ? "bg-blue-50 text-blue-700 font-medium"
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
        </aside>

        {/* Main Content - This is where child pages render */}
        <main className="flex-1 ml-64 p-6">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

