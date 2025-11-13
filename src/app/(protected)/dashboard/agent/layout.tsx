// src/app/(protected)/dashboard/agent/layout.tsx
"use client";
import {
  ChevronDown,
  DollarSign,
  Home,
  List,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
  const {status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

 
  // const getAvatarFallback = () => {
  //   if (session?.user?.name) {
  //     return session.user.name
  //       .split(" ")
  //       .map((n) => n[0])
  //       .join("")
  //       .toUpperCase()
  //       .slice(0, 2);
  //   }
  //   return "AG";
  // };

  // Keep expanded state in URL query
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const coupons = params.get("menu") === "coupons";
    const earnings = params.get("menu") === "earnings";
    setExpanded({ coupons, earnings });
  }, [pathname]);

  const toggleMenu = (key: string) => {
    const newState = !expanded[key];
    setExpanded((prev) => ({ ...prev, [key]: newState }));

    const params = new URLSearchParams(window.location.search);
    if (newState) {
      params.set("menu", key);
    } else {
      params.delete("menu");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
        { title: "Coupon Types", href: "/dashboard/agent/coupon-types", icon: Ticket },
      ],
    },
    {
      title: "Earnings",
      icon: TrendingUp,
      key: "earnings",
      subItems: [
        { title: "Commission Overview", href: "/dashboard/agent/earnings", icon: DollarSign },
        { title: "Payout History", href: "/dashboard/agent/payouts", icon: Wallet },
      ],
    },
    {
      title: "Assign Coupons",
      icon: Users,
      href: "/dashboard/agent/assign-coupons",
      single: true,
    },
  ];

  // const handleLogout = async () => {
  //   await signOut({ callbackUrl: "/auth/login" });
  // };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      {/* <nav className="bg-white shadow-sm border-b px-6 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FT</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">FutureTek Agent</h1>
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
                  <span className="text-sm font-medium text-gray-700 block">{userName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
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
      </nav> */}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4 fixed left-0 top-16 overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.title}>
                {item.single ? (
                  <Link href={item.href} prefetch={true}>
                    <div
                      className={`w-full flex items-center gap-3 rounded-lg p-3 transition-all cursor-pointer ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center justify-between gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expanded[item.key] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded[item.key] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((sub) => (
                          <Link key={sub.href} href={sub.href} prefetch={true}>
                            <div
                              className={`w-full flex items-center gap-3 rounded-lg p-2 pl-3 transition-all cursor-pointer ${
                                isActive(sub.href)
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <sub.icon className="h-4 w-4" />
                              <span className="text-sm">{sub.title}</span>
                            </div>
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

        {/* Main Content */}
        <main className="flex-1 ml-64  p-6 min-h-screen">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}