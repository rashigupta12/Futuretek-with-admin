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
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Loader2,
  Sparkles,
  Tag,
  TrendingUp,
  Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

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

interface CourseCategory {
  type: 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING';
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badgeColor: string;
  courses: Course[];
}

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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

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
        
        const filteredCourses = rawCourses.filter((course: Course) => 
          ['UPCOMING', 'REGISTRATION_OPEN', 'ONGOING'].includes(course.status)
        );
        
        setCourses(filteredCourses);
        const basePrices: Record<string, CoursePriceData> = {};
        filteredCourses.forEach((course: Course) => {
          basePrices[course.id] = {
            originalPrice: course.priceINR.toString(),
            finalPrice: course.priceINR.toString(),
            discountAmount: "0",
            hasAssignedCoupon: false
          };
        });
        setCoursePrices(basePrices);
        setLoading(false);

        if (userId && filteredCourses.length > 0) {
          const [enrollData, ...priceResults] = await Promise.all([
            fetch(`/api/user/enrollments`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null),
            // Fetch all course prices in parallel (limit to 10 concurrent requests)
            ...batchFetch(rawCourses)
          ]);

          if (enrollData?.enrollments && Array.isArray(enrollData.enrollments)) {
            const enrolledIds = new Set<string>(
              enrollData.enrollments
                .filter((e: any) => e.status === "ACTIVE" || e.status === "COMPLETED")
                .map((e: any) => e.courseId as string)
            );
            setEnrolledCourseIds(enrolledIds);
          }

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
    function batchFetch(courses: Course[]) {
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

  // Check if user is admin or agent
  const isAdminOrAgent = userRole === 'ADMIN' || userRole === 'AGENT';

  const courseCategories: CourseCategory[] = [
    {
      type: 'REGISTRATION_OPEN',
      title: 'Enrolling Now',
      description: 'Courses currently open for registration',
      icon: <TrendingUp className="h-4 w-4" />,
      gradient: 'from-blue-600 to-blue-800',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      courses: courses.filter(course => course.status === 'REGISTRATION_OPEN')
    },
    {
      type: 'UPCOMING',
      title: 'Coming Soon',
      description: 'Courses starting soon',
      icon: <Clock className="h-4 w-4" />,
      gradient: 'from-amber-600 to-amber-800',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600',
      courses: courses.filter(course => course.status === 'UPCOMING')
    },
    {
      type: 'ONGOING',
      title: 'In Progress',
      description: 'Courses currently running',
      icon: <BookOpen className="h-4 w-4" />,
      gradient: 'from-blue-700 to-indigo-800',
      badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      courses: courses.filter(course => course.status === 'ONGOING')
    }
  ];

  const getPlainText = (html: string) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const scroll = (direction: 'left' | 'right', category: keyof typeof scrollRefs) => {
    const container = scrollRefs[category].current;
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
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
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Unable to Load Courses
            </h3>
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

  const totalCourses = courseCategories.reduce((sum, category) => sum + category.courses.length, 0);
  
  if (totalCourses === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl border border-blue-100 p-8 shadow-lg max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No Courses Available Yet
            </h3>
            <p className="text-gray-600 mb-2">
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
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-amber-700 bg-clip-text text-transparent mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master ancient sciences with our comprehensive curriculum designed by expert practitioners
          </p>
        </div>

        {/* Course Categories */}
        {courseCategories.map((category) => {
          if (category.courses.length === 0) return null;

          const showScrollControls = category.courses.length > 4;
          const scrollRef = scrollRefs[category.type];

          return (
            <div key={category.type} className="mb-12 last:mb-0">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${category.gradient} text-white shadow-md`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>

                {showScrollControls && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scroll('left', category.type)}
                      className="h-8 w-8 border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scroll('right', category.type)}
                      className="h-8 w-8 border-blue-200 hover:bg-blue-50 text-blue-600"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Courses Container */}
              <div className="relative">
                <div
                  ref={scrollRef}
                  className={`gap-4 ${
                    showScrollControls 
                      ? 'flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory' 
                      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                  style={
                    showScrollControls 
                      ? { 
                          display: 'flex',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        } 
                      : {}
                  }
                >
                  {category.courses.map((course) => {
                    const isEnrolled = userId ? enrolledCourseIds.has(course.id) : false;
                    const priceInfo = getDisplayPrice(course);

                    return (
                      <Card
                        key={course.id}
                        className={`flex flex-col group hover:shadow-lg transition-all duration-300 border border-blue-100 bg-white overflow-hidden relative hover:-translate-y-1 shadow-sm ${
                          showScrollControls ? 'min-w-[280px] snap-start flex-shrink-0' : ''
                        }`}
                      >
                        {/* Status Badge */}
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${category.badgeColor}`}>
                          {category.type === 'REGISTRATION_OPEN' ? 'Enrolling' : 
                           category.type === 'UPCOMING' ? 'Coming Soon' : 'In Progress'}
                        </div>

                        <CardHeader className="pb-4 pt-12">
                          <CardTitle className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                            {course.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 pb-3">
                          <CardDescription className="line-clamp-2 text-sm text-gray-600 leading-relaxed mb-4">
                            {getPlainText(course.description)}
                          </CardDescription>

                          {/* Price Section */}
                          <div className="space-y-2 bg-gradient-to-br from-blue-50/50 to-amber-50/30 rounded-lg p-3 border border-blue-100">
                            {userId && priceInfo.hasDiscount && priceInfo.appliedCoupon && (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded px-2 py-1.5 shadow-sm">
                                <Tag className="h-3 w-3 text-white" />
                                <span className="text-xs font-semibold text-white">
                                  {priceInfo.appliedCoupon.code} Applied!
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
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
                                onClick={() => window.scrollTo(0, 0)}
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
                            ) : isAdminOrAgent ? (
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
                                  href={`/courses/${course.slug}?enroll=true`}
                                  className="flex items-center justify-center gap-1"
                                  onClick={() => window.scrollTo(0, 0)}
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