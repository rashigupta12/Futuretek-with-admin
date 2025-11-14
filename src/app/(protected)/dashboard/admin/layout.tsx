"use client";
import {
  Award,
  BookOpen,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  List,
  Plus,
  Tag,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

type SingleNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  single: true;
};

type GroupNavItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  key: "courses" | "blogs" | "coupons" | "certificates" | "agent"|"users";
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
  // const { data: session, status } = useSession();

  const [expandedMenus, setExpandedMenus] = useState<
    Record<"courses" | "blogs" | "coupons" | "certificates" | "agent" |"users", boolean>
  >({
    courses: true,
    blogs: false,
    coupons: false,
    certificates: false,
    agent: false,
    users:false
  });

  // const handleLogout = async () => {
  //   await signOut({ redirectTo: "/auth/login" });
  // };

  const toggleMenu = (menu: keyof typeof expandedMenus) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => pathname === path;

  // Get user data from session
  // const userName = session?.user?.name || session?.user?.role;
  // const userImage = session?.user?.image || "/images/user_alt_icon.png";

  // Generate avatar fallback from name
  // const getAvatarFallback = () => {
  //   if (session?.user?.name) {
  //     return session.user.name
  //       .split(" ")
  //       .map((n) => n[0])
  //       .join("")
  //       .toUpperCase()
  //       .slice(0, 2);
  //   }
  //   return "AD";
  // };

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
      title: "Agent",
      icon: BookOpen,
      key: "agent",
      subItems: [
        { title: "All Agent", href: "/dashboard/admin/agent", icon: List },
        {
          title: "Add agent",
          href: "/dashboard/admin/agent/add",
          icon: Plus,
        },
      ],
    },
    {
      title: "Coupons Types",
      icon: Tag,
      key: "coupons",
      subItems: [
        {
          title: "All Coupons Types",
          href: "/dashboard/admin/coupons-types",
          icon: List,
        },
        {
          title: "Add Coupon Type",
          href: "/dashboard/admin/coupons-types/add",
          icon: Plus,
        },

         {
          title: "Add Coupon",
          href: "/dashboard/admin/coupons/add",
          icon: Plus,
        },
      ],
    },

   {
  title: "Users & Enrollments",
  icon: Users,
  key: "users",
  subItems: [
    { title: "All Users", href: "/dashboard/admin/users", icon: List },
    { title: "Enrollments", href: "/dashboard/admin/enrollments", icon: Users },
    { title: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
  ],
},
   
    // {
    //   title: "Payments",
    //   icon: CreditCard,
    //   href: "/dashboard/admin/payments",
    //   single: true,
    // },
    // {
    //   title: "Certificates",
    //   icon: Award,
    //   key: "certificates",
    //   subItems: [
    //     {
    //       title: "Requests",
    //       href: "/dashboard/admin/certificates/requests",
    //       icon: List,
    //     },
    //     {
    //       title: "All Certificates",
    //       href: "/dashboard/admin/certificates",
    //       icon: Award,
    //     },
    //   ],
    // },
    // {
    //   title: "Website Content",
    //   icon: Globe,
    //   href: "/dashboard/admin/website-content",
    //   single: true,
    // },
    // {
    //   title: "Analytics",
    //   icon: BarChart3,
    //   href: "/dashboard/admin/analytics",
    //   single: true,
    // },
  ];

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">FT</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      {/* <nav className="bg-white shadow-sm border-b px-6 py-3 fixed top-0 left-0 right-0 z-50">
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
      </nav> */}

      <div className="flex">
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

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
