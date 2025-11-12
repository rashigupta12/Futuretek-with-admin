/*eslint-disable @typescript-eslint/no-explicit-any*/
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
  Clock,
  Loader2,
  Star,
  TrendingUp,
  Tag,
  Sparkles,
  Award,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

interface CoursePriceData {
  originalPrice: string;
  finalPrice: string;
  discountAmount: string;
  appliedCoupon?: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: string;
  };
  hasAssignedCoupon: boolean;
}

export function CoursesCatalog() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [coursePrices, setCoursePrices] = useState<Record<string, CoursePriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses first and show them immediately
        const coursesRes = await fetch("/api/courses");
        if (!coursesRes.ok) {
          throw new Error(`Failed to fetch courses: ${coursesRes.status}`);
        }
        
        const contentType = coursesRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }
        
        const data = await coursesRes.json();
        const rawCourses = data.courses || [];
        
        // Set courses immediately with base prices
        setCourses(rawCourses);
        const basePrices: Record<string, CoursePriceData> = {};
        rawCourses.forEach((course: Course) => {
          basePrices[course.id] = {
            originalPrice: course.priceINR.toString(),
            finalPrice: course.priceINR.toString(),
            discountAmount: "0",
            hasAssignedCoupon: false
          };
        });
        setCoursePrices(basePrices);
        setLoading(false); // Show UI immediately

        // If user is logged in, fetch enrollments and prices in parallel (non-blocking)
        if (userId && rawCourses.length > 0) {
          // Fetch enrollments and prices in parallel
          const [enrollData, ...priceResults] = await Promise.all([
            fetch(`/api/user/enrollments`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null),
            // Fetch all course prices in parallel (limit to 10 concurrent requests)
            ...batchFetch(rawCourses, 10)
          ]);

          // Update enrollments
          if (enrollData?.enrollments && Array.isArray(enrollData.enrollments)) {
            const enrolledIds = new Set<string>(
              enrollData.enrollments
                .filter((e: any) => e.status === "ACTIVE" || e.status === "COMPLETED")
                .map((e: any) => e.courseId as string)
            );
            setEnrolledCourseIds(enrolledIds);
          }

          // Update prices
          const pricesMap: Record<string, CoursePriceData> = { ...basePrices };
          priceResults.forEach(result => {
            if (result && result.priceData) {
              pricesMap[result.courseId] = {
                originalPrice: result.priceData.originalPrice || result.priceData.priceINR,
                finalPrice: result.priceData.finalPrice || result.priceData.priceINR,
                discountAmount: result.priceData.discountAmount || "0",
                appliedCoupon: result.priceData.appliedCoupon,
                hasAssignedCoupon: result.priceData.hasAssignedCoupon || false
              };
            }
          });
          setCoursePrices(pricesMap);
        }
      } catch (err) {
        console.error("Catalog load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load courses");
        setLoading(false);
      }
    }

    // Helper function to batch fetch with concurrency limit
    function batchFetch(courses: Course[], concurrency: number) {
      return courses.map(course => 
        fetch(`/api/courses/${course.slug}`)
          .then(res => {
            if (res.ok) {
              const contentType = res.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                return res.json().then(data => ({
                  courseId: course.id,
                  priceData: data.course
                }));
              }
            }
            return null;
          })
          .catch(() => null)
      );
    }

    if (status !== "loading") {
      fetchData();
    }
  }, [userId, status]);

  const getPlainText = (html: string) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const getStatusBadge = (status: Course["status"]) => {
    const cfg: Record<
      Course["status"],
      { label: string; color: string; icon?: React.ReactNode }
    > = {
      REGISTRATION_OPEN: {
        label: "Enrolling Now",
        color: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-0",
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      },
      UPCOMING: {
        label: "Coming Soon",
        color: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md border-0",
        icon: <Clock className="h-3.5 w-3.5" />,
      },
      ONGOING: {
        label: "In Progress",
        color: "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md border-0",
        icon: <BookOpen className="h-3.5 w-3.5" />,
      },
      COMPLETED: {
        label: "Completed",
        color: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm border-0",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      },
      DRAFT: {
        label: "Draft",
        color: "bg-gray-100 text-gray-600 border border-gray-300",
      },
      ARCHIVED: {
        label: "Archived",
        color: "bg-gray-100 text-gray-600 border border-gray-300",
      },
    };
    const { label, color, icon } = cfg[status] ?? cfg.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  const getDisplayPrice = (course: Course) => {
    const priceData = coursePrices[course.id];
    
    if (priceData && priceData.hasAssignedCoupon) {
      const originalPrice = parseFloat(priceData.originalPrice);
      const finalPrice = parseFloat(priceData.finalPrice);
      const discountAmount = parseFloat(priceData.discountAmount);
      
      return {
        displayPrice: finalPrice,
        originalPrice: originalPrice,
        hasDiscount: finalPrice < originalPrice,
        discountAmount: discountAmount,
        appliedCoupon: priceData.appliedCoupon
      };
    }

    return {
      displayPrice: course.priceINR,
      originalPrice: course.priceINR,
      hasDiscount: false,
      discountAmount: 0,
      appliedCoupon: undefined
    };
  };

  if (status === "loading" || loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">Loading courses...</p>
            <p className="text-sm text-gray-600">Discovering amazing learning opportunities</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-0 p-12 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Load Courses
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 h-auto text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-0 p-12 shadow-2xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Courses Available Yet
            </h3>
            <p className="text-gray-600 mb-2 text-lg">
              Check back soon for new courses!
            </p>
            <p className="text-sm text-gray-500">
              We&apos;re preparing something amazing for you.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-5 py-2.5 text-sm font-bold mb-6 border-0 shadow-lg">
            <Sparkles className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            <span>Our Premium Courses</span>
            <Award className="h-4 w-4" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-5">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master ancient sciences with our comprehensive curriculum designed
            by expert practitioners
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {courses.map((course) => {
            const isEnrolled = userId ? enrolledCourseIds.has(course.id) : false;
            const priceInfo = getDisplayPrice(course);

            return (
              <Card
                key={course.id}
                className="flex flex-col group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative hover:-translate-y-2 shadow-lg"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 group-hover:h-1.5 transition-all duration-300"></div>

                <CardHeader className="pb-6 pt-6 relative">
                  {getStatusBadge(course.status)}
                  <CardTitle className="line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mt-10 pt-5">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed mb-6">
                    {getPlainText(course.description)}
                  </CardDescription>

                  <div className="space-y-3 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200 shadow-sm">
                    {userId && priceInfo.hasDiscount && priceInfo.appliedCoupon && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-2.5 shadow-md">
                        <div className="p-1 bg-white/20 rounded">
                          <Tag className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-white">
                          {priceInfo.appliedCoupon.code} Applied!
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-right flex-1">
                        {priceInfo.hasDiscount ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-gray-900 text-xl">
                                ₹{priceInfo.displayPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{priceInfo.originalPrice.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                              <Sparkles className="h-3 w-3" />
                              Save ₹{priceInfo.discountAmount.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900 text-xl">
                            ₹{priceInfo.displayPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-transparent">
                  <div className="flex gap-3 w-full">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl transition-all duration-300 h-11 font-bold border-0 rounded-lg"
                    >
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center justify-center gap-2"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>

                    {isEnrolled ? (
                      <Button
                        disabled
                        size="sm"
                        variant="outline"
                        className="flex-1 border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed h-11 font-bold rounded-lg shadow-md"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-xl transition-all duration-300 h-11 font-bold border-0 rounded-lg"
                      >
                        <Link 
                          href={`/courses/${course.slug}`}
                          className="flex items-center justify-center gap-2"
                        >
                          Buy Now
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
    </section>
  );
}