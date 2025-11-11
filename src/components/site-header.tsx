"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  Menu,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Home,
  BookOpen,
  Info,
  Briefcase,
  Mail,
  Sparkles,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import Link from "next/link";
import { DialogTitle } from "./ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FuturetekLogo } from "./FutureTekLogo";

type Course = {
  id: string;
  title: string;
  slug: string;
};

export function SiteHeader() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("session", session);
  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/admin/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <header className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-4 px-4">
        <div className="mr-10 flex items-center gap-3">
          <Sidebar session={session} handleLogout={handleLogout} />
          <Link href="/">
            <FuturetekLogo width={180} height={54} />
          </Link>
        </div>
        <nav className="text-slate-600 hover:[&_a]:text-slate-900 hidden items-center gap-6 text-sm font-medium md:flex [&_a]:transition-colors">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors text-sm font-medium text-slate-600 hover:text-slate-900">
              Courses
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg p-2 w-56 mt-2 z-50">
              {loading ? (
                <div className="px-4 py-2 text-sm text-slate-500">
                  Loading...
                </div>
              ) : (
                courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block px-4 py-2.5 hover:bg-blue-50 rounded-md transition-colors text-sm text-slate-700 hover:text-blue-700"
                  >
                    {course.title}
                  </Link>
                ))
              )}
            </div>
          </div>
          <Link
            href="/about"
            className="hover:text-blue-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="/career"
            className="hover:text-blue-600 transition-colors"
          >
            Career
          </Link>
          <Link
            href="/contact"
            className="hover:text-blue-600 transition-colors"
          >
            Contact Us
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden md:inline text-sm text-slate-700">
                Welcome, {session.user.name}
              </span>
              <Button asChild variant="ghost" className="hidden md:flex hover:bg-blue-50 hover:text-blue-700">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="hidden md:flex border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </Button>
              {/* Mobile icons */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashboard</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:flex hover:bg-blue-50 hover:text-blue-700">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
              {/* Mobile icons */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Link href="/auth/login">
                      <LogIn className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Login</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="default"
                    size="icon"
                    className="md:hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Link href="/auth/register">
                      <UserPlus className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign Up</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  session,
  handleLogout,
}: {
  session: Session | null;
  handleLogout: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/admin/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/about", label: "About", icon: Info },
    { href: "/career", label: "Career", icon: Briefcase },
    { href: "/contact", label: "Contact Us", icon: Mail },
  ];

  const courseItems = loading
    ? [{ href: "#", label: "Loading..." }]
    : courses.map((course) => ({
        href: `/courses/${course.slug}`,
        label: course.title,
      }));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
        <SheetTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border-slate-300 size-9 shrink-0 border md:hidden hover:bg-blue-50 hover:text-blue-700"
            >
              <Menu className="size-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </TooltipTrigger>
        </SheetTrigger>
        <TooltipContent align="start">Menu</TooltipContent>
        <SheetContent side="left" className="flex w-[300px] flex-col p-0 pt-10">
          <div className="px-6 py-4">
            <Link href="/">
              <FuturetekLogo width={180} height={54} />
            </Link>
          </div>

          <Separator />

          {/* User Section */}
          {session && (
            <>
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50">
                <p className="text-sm text-slate-600">Welcome back,</p>
                <p className="font-semibold text-blue-900">
                  {session.user.name}
                </p>
              </div>
              <Separator />
            </>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {session && (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 hover:bg-blue-50 hover:text-blue-700"
                    onClick={handleLinkClick}
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </Button>
                  <Separator className="my-2" />
                </>
              )}

              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 hover:bg-blue-50 hover:text-blue-700"
                    onClick={handleLinkClick}
                  >
                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}

              <div className="pt-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course Categories
                </p>
                {courseItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className="w-full justify-start pl-12 h-10 text-sm hover:bg-blue-50 hover:text-blue-700"
                    onClick={handleLinkClick}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          <Separator />

          {/* Bottom Actions */}
          <div className="p-3 space-y-2">
            {session ? (
              <Button
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
                variant="outline"
                className="w-full justify-start gap-3 h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-3 h-11 border-slate-300 hover:bg-blue-50 hover:text-blue-700"
                  onClick={handleLinkClick}
                >
                  <Link href="/auth/login">
                    <LogIn className="h-5 w-5" />
                    <span className="font-medium">Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start gap-3 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  onClick={handleLinkClick}
                >
                  <Link href="/auth/register">
                    <UserPlus className="h-5 w-5" />
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Tooltip>
    </Sheet>
  );
}