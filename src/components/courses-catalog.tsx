/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

/* --------------------------------------------------------------
   Types
-------------------------------------------------------------- */
interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  status:
    | "REGISTRATION_OPEN"
    | "COMPLETED"
    | "DRAFT"
    | "UPCOMING"
    | "ONGOING"
    | "ARCHIVED";
  priceINR: number;
  priceUSD: number;
  currentEnrollments: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  discountAmount: number;
  creatorType: "ADMIN" | "JYOTISHI";
  creatorName?: string;
  isPersonal: boolean;
}

interface CoursePriceData {
  originalPrice: string;
  finalPrice: string;
  discountAmount: string;
  adminDiscountAmount?: string;
  jyotishiDiscountAmount?: string;
  priceAfterAdminDiscount?: string;
  appliedCoupons?: AppliedCoupon[];
  hasAssignedCoupon: boolean;
}

interface CourseCategory {
  type: "UPCOMING" | "REGISTRATION_OPEN" | "ONGOING";
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badgeColor: string;
  courses: Course[];
}

/* --------------------------------------------------------------
   Plain‑text cache (runs once per description)
-------------------------------------------------------------- */
const plainTextCache = new Map<string, string>();
const getPlainText = (html: string): string => {
  if (!html) return "";
  if (plainTextCache.has(html)) return plainTextCache.get(html)!;
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  plainTextCache.set(html, text);
  return text;
};

/* --------------------------------------------------------------
   Main component
-------------------------------------------------------------- */
export function CoursesCatalog() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;
  const userRole = session?.user?.role as string | undefined;

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [coursePrices, setCoursePrices] = useState<Record<string, CoursePriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRefs = {
    UPCOMING: useRef<HTMLDivElement>(null),
    REGISTRATION_OPEN: useRef<HTMLDivElement>(null),
    ONGOING: useRef<HTMLDivElement>(null),
  };

  /* --------------------------------------------------------------
     Data fetching – parallel, includes public discounts
  -------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      if (status === "loading") return;

      try {
        setLoading(true);
        setError(null);

        /* 1. Courses list */
        const coursesRes = await fetch("/api/courses");
        if (!coursesRes.ok) throw new Error(`Courses: ${coursesRes.status}`);
        const data = await coursesRes.json();
        const rawCourses: Course[] = data.courses || [];

        const filtered = rawCourses.filter(c =>
          ["UPCOMING", "REGISTRATION_OPEN", "ONGOING"].includes(c.status)
        );

        if (cancelled) return;
        setCourses(filtered);

        /* Base price map */
        const base: Record<string, CoursePriceData> = {};
        filtered.forEach(c => {
          base[c.id] = {
            originalPrice: c.priceINR.toString(),
            finalPrice: c.priceINR.toString(),
            discountAmount: "0",
            hasAssignedCoupon: false,
          };
        });
        setCoursePrices(base);

        /* 2. Enrollments (only if logged in) */
        let enrolled = new Set<string>();
        if (userId && filtered.length) {
          const enrollRes = await fetch("/api/user/enrollments");
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            if (enrollData?.enrollments) {
              enrolled = new Set(
                enrollData.enrollments
                  .filter((e: any) => e.status === "ACTIVE" || e.status === "COMPLETED")
                  .map((e: any) => e.courseId as string)
              );
            }
          }
        }

        /* 3. Per‑course price details (public discounts included) */
        const pricePromises = filtered.map(c =>
          fetch(`/api/courses/${c.slug}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        );
        const priceResults = await Promise.all(pricePromises);

        if (cancelled) return;

        const finalPrices: Record<string, CoursePriceData> = { ...base };
        priceResults.forEach((res, i) => {
          if (!res?.course) return;
          const course = filtered[i];
          const pd = res.course;

          // **Public discounts are now applied even without login**
          finalPrices[course.id] = {
            originalPrice: pd.originalPrice ?? base[course.id].originalPrice,
            finalPrice: pd.finalPrice ?? base[course.id].finalPrice,
            discountAmount: pd.discountAmount ?? "0",
            adminDiscountAmount: pd.adminDiscountAmount,
            jyotishiDiscountAmount: pd.jyotishiDiscountAmount,
            priceAfterAdminDiscount: pd.priceAfterAdminDiscount,
            appliedCoupons: pd.appliedCoupons,
            hasAssignedCoupon: !!pd.hasAssignedCoupon,
          };
        });

        setEnrolledCourseIds(enrolled);
        setCoursePrices(finalPrices);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [userId, status]);

  const isAdminOrJyotishi = userRole === "ADMIN" || userRole === "JYOTISHI";

  /* --------------------------------------------------------------
     Category data – memoised
  -------------------------------------------------------------- */
  const courseCategories: CourseCategory[] = useMemo(
    () => [
      {
        type: "REGISTRATION_OPEN",
        title: "Enrolling Now",
        description: "Courses currently open for registration",
        icon: <TrendingUp className="h-4 w-4" />,
        gradient: "from-blue-600 to-blue-800",
        badgeColor: "bg-gradient-to-r from-blue-500 to-blue-600",
        courses: courses.filter(c => c.status === "REGISTRATION_OPEN"),
      },
      {
        type: "ONGOING",
        title: "In Progress",
        description: "Courses with active sessions",
        icon: <BookOpen className="h-4 w-4" />,
        gradient: "from-blue-700 to-indigo-800",
        badgeColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
        courses: courses.filter(c => c.status === "ONGOING"),
      },
      {
        type: "UPCOMING",
        title: "Coming Soon",
        description: "Courses starting soon",
        icon: <Clock className="h-4 w-4" />,
        gradient: "from-amber-600 to-amber-800",
        badgeColor: "bg-gradient-to-r from-amber-500 to-amber-600",
        courses: courses.filter(c => c.status === "UPCOMING"),
      },
    ],
    [courses]
  );

  /* --------------------------------------------------------------
     Scroll handler – memoised
  -------------------------------------------------------------- */
  const scroll = useCallback(
    (direction: "left" | "right", category: keyof typeof scrollRefs) => {
      const el = scrollRefs[category].current;
      if (!el) return;
      const cardWidth = 320;
      el.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    },
    []
  );

  /* --------------------------------------------------------------
     Price helper – **now works for guests too**
  -------------------------------------------------------------- */
  const getDisplayPrice = useCallback(
    (course: Course) => {
      const pd = coursePrices[course.id];

      // **Discounts are shown even if no user is logged in**
      if (pd?.appliedCoupons?.length) {
        const orig = parseFloat(pd.originalPrice);
        const fin = parseFloat(pd.finalPrice);
        const disc = parseFloat(pd.discountAmount);
        return {
          displayPrice: fin,
          originalPrice: orig,
          hasDiscount: fin < orig,
          discountAmount: disc,
          appliedCoupons: pd.appliedCoupons,
          hasAssignedCoupon: pd.hasAssignedCoupon,
        };
      }

      return {
        displayPrice: course.priceINR,
        originalPrice: course.priceINR,
        hasDiscount: false,
        discountAmount: 0,
        appliedCoupons: undefined,
        hasAssignedCoupon: false,
      };
    },
    [coursePrices]
  );

  const getCouponBadgeColor = (t: "ADMIN" | "JYOTISHI") =>
    t === "ADMIN" ? "from-green-500 to-green-600" : "from-blue-500 to-blue-600";

  const getCouponIcon = (t: "ADMIN" | "JYOTISHI") =>
    t === "ADMIN" ? <Crown className="h-3 w-3" /> : <Users className="h-3 w-3" />;

  /* --------------------------------------------------------------
     Loading / error / empty UI
  -------------------------------------------------------------- */
  if (status === "loading" || loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">Loading Courses</p>
            <p className="text-sm text-gray-600">Discovering amazing learning opportunities</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl border border-blue-100 p-8 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Courses</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white px-6 py-3 h-auto font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const totalCourses = courseCategories.reduce((s, c) => s + c.courses.length, 0);
  if (totalCourses === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl border border-blue-100 p-8 shadow-lg max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Courses Available Yet</h3>
            <p className="text-gray-600 mb-2">Check back soon for new courses!</p>
            <p className="text-sm text-gray-500">We&apos;re preparing something amazing for you.</p>
          </div>
        </div>
      </section>
    );
  }

  /* --------------------------------------------------------------
     Render – shows public discounts for all users
  -------------------------------------------------------------- */
  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-amber-700 bg-clip-text text-transparent mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master ancient sciences with our comprehensive curriculum designed by expert practitioners
          </p>
        </div>

        {courseCategories.map(category => {
          if (!category.courses.length) return null;
          const showScroll = category.courses.length > 3;
          const ref = scrollRefs[category.type];

          return (
            <div key={category.type} className="mb-12 last:mb-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${category.gradient} text-white shadow-md`}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>

                {showScroll && (
                  <div className="hidden md:flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scroll("left", category.type)}
                      className="h-9 w-9 p-0 border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scroll("right", category.type)}
                      className="h-9 w-9 p-0 border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div
                  ref={ref}
                  className={
                    showScroll
                      ? "flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  }
                  style={
                    showScroll
                      ? {
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          WebkitOverflowScrolling: "touch",
                        }
                      : {}
                  }
                >
                  <style jsx>{`
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {category.courses.map(course => {
                    const isEnrolled = userId ? enrolledCourseIds.has(course.id) : false;
                    const priceInfo = getDisplayPrice(course);

                    return (
                      <Card
                        key={course.id}
                        className={`flex flex-col group hover:shadow-lg transition-all duration-300 border border-blue-100 bg-white overflow-hidden relative hover:-translate-y-1 shadow-sm ${
                          showScroll ? "w-[300px] flex-shrink-0 snap-start" : ""
                        }`}
                      >
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                            {course.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 pb-3">
                          <CardDescription className="line-clamp-3 text-sm text-gray-600 leading-relaxed mb-4 min-h-[60px]">
                            {getPlainText(course.description)}
                          </CardDescription>

                          {/* Public coupons are now shown */}
                          {priceInfo.appliedCoupons?.length ? (
                            <div className="space-y-1 mb-2">
                              {priceInfo.appliedCoupons.map(coupon => (
                                <div
                                  key={coupon.id}
                                  className={`inline-flex items-center gap-1 bg-gradient-to-r ${getCouponBadgeColor(
                                    coupon.creatorType
                                  )} text-white px-2 py-1 rounded text-xs font-medium`}
                                >
                                  {getCouponIcon(coupon.creatorType)}
                                  <span>Discount Applied</span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="space-y-2 bg-gradient-to-br from-blue-50/50 to-amber-50/30 rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span>{course.currentEnrollments} enrolled</span>
                              </div>

                              <div className="text-right">
                                {priceInfo.hasDiscount ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-end gap-1">
                                      <span className="font-bold text-gray-900 text-base">
                                        ₹{priceInfo.displayPrice.toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-xs text-gray-500 line-through">
                                        ₹{priceInfo.originalPrice.toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">
                                      <Sparkles className="h-2.5 w-2.5" />
                                      Save ₹{priceInfo.discountAmount.toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-bold text-gray-900 text-base">
                                    ₹{priceInfo.displayPrice.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-blue-50 bg-gradient-to-br from-gray-50/30 to-transparent">
                          <div className="flex gap-2 w-full">
                            <Button
                              asChild
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-9 text-xs font-semibold border-0 rounded-md"
                            >
                              <Link
                                href={`/courses/${course.slug}`}
                                className="flex items-center justify-center gap-1"
                              >
                                View Details
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </Button>

                            {isEnrolled ? (
                              <Button
                                disabled
                                size="sm"
                                variant="outline"
                                className="flex-1 border-green-200 bg-green-50 text-green-700 cursor-not-allowed h-9 text-xs font-semibold rounded-md"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enrolled
                              </Button>
                            ) : isAdminOrJyotishi ? (
                              <Button
                                disabled
                                size="sm"
                                variant="outline"
                                className="flex-1 border-amber-200 bg-amber-50 text-amber-700 cursor-not-allowed h-9 text-xs font-semibold rounded-md"
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                Staff
                              </Button>
                            ) : (
                              <Button
                                asChild
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm hover:shadow-md transition-all duration-300 h-9 text-xs font-semibold border-0 rounded-md"
                              >
                                <Link
                                  href={
                                    userId
                                      ? `/courses/${course.slug}?enroll=true`
                                      : `/auth/login?callbackUrl=/courses/${course.slug}?enroll=true`
                                  }
                                  className="flex items-center justify-center gap-1"
                                >
                                  Enroll Now
                                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}