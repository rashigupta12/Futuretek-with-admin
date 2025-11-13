/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CheckoutSidebar } from "@/components/checkout/CheckoutSidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  Shield,
  Star,
  Target,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------
   Types (unchanged)
------------------------------------------------------------- */
interface CourseData {
  appliedCoupons?: Array<{
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: string;
    discountAmount: number;
    creatorType: "ADMIN" | "JYOTISHI";
    creatorName?: string;
    isPersonal: boolean;
  }>;
  finalPrice?: string;
  originalPrice?: string;
  discountAmount?: string;
  adminDiscountAmount?: string;
  jyotishiDiscountAmount?: string;
  priceAfterAdminDiscount?: string;
  hasAssignedCoupon?: boolean;
  id: string;
  title: string;
  description: string;
  slug: string;
  tagline?: string;
  instructor?: string;
  duration?: string;
  totalSessions?: number;
  priceINR?: string;
  priceUSD?: string;
  status?: string;
  features?: string[] | Array<{ feature: string }>;
  whyLearn?: Array<{ title: string; description: string }>;
  whyLearnIntro?: string;
  whatYouLearn?: string;
  courseContent?: string[];
  topics?: string[];
  relatedTopics?: string[];
  enrollment?: {
    title: string;
    description: string;
    offer: { badge: string; guarantee: string };
    features: Array<{ icon: string; text: string }>;
  };
  disclaimer?: string;
  maxStudents?: number;
  currentEnrollments?: number;
}

/* -------------------------------------------------------------
   Cached plain‑text extractor (runs once per HTML string)
------------------------------------------------------------- */
const plainTextCache = new Map<string, string>();
const getPlainText = (html: string): string => {
  if (!html) return "";
  if (plainTextCache.has(html)) return plainTextCache.get(html)!;
  const txt = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  plainTextCache.set(html, txt);
  return txt;
};

/* -------------------------------------------------------------
   Safe HTML component (unchanged)
------------------------------------------------------------- */
function SafeHTML({ content, className = "" }: { content: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
}

/* -------------------------------------------------------------
   Fetch course – client‑side, with cache‑control
------------------------------------------------------------- */
const fetchCourse = async (slug: string): Promise<CourseData | null> => {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/courses/${slug}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // ISR‑like cache
    });

    if (!res.ok) return res.status === 404 ? null : null;
    const { course } = await res.json();

    if (!course?.id) return null;

    // Normalise features
    if (Array.isArray(course.features)) {
      course.features = course.features.map((f: any) =>
        typeof f === "string" ? f : f.feature || f
      );
    }

    if (course.topics && !course.relatedTopics) course.relatedTopics = course.topics;

    return course;
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------
   MAIN PAGE
------------------------------------------------------------- */
export default function CoursePage() {
  const params = useParams();
  const slug = params?.course as string;
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();
  const userId = session?.user?.id as string | undefined;
  const userRole = session?.user?.role as string | undefined;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoOpenCheckout = searchParams.get("enroll") === "true";
  const [showCheckout, setShowCheckout] = useState(autoOpenCheckout);
  const isAdminOrJyotishi = userRole === "ADMIN" || userRole === "JYOTISHI";

  /* ---------------------------------------------------------
     Scroll to top – only once
  --------------------------------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ---------------------------------------------------------
     Load course + enrollment in parallel
  --------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!slug || authStatus === "loading") return;

      try {
        setLoading(true);
        setError(null);

        const [c, enrollRes] = await Promise.all([
          fetchCourse(slug),
          userId
            ? fetch("/api/user/enrollments").then(r => (r.ok ? r.json() : null))
            : Promise.resolve(null),
        ]);

        if (cancelled) return;
        if (!c) throw new Error("Course not found");

        setCourse(c);

        if (enrollRes?.enrollments) {
          const enrolled = enrollRes.enrollments.some(
            (e: any) =>
              e.courseId === c.id && (e.status === "ACTIVE" || e.status === "COMPLETED")
          );
          setIsEnrolled(enrolled);
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, userId, authStatus]);

  /* ---------------------------------------------------------
     Price calculation – memoised, runs once
  --------------------------------------------------------- */
  const priceInfo = useMemo(() => {
    if (!course) return null;
    const orig = parseFloat(course.originalPrice || course.priceINR || "0");
    const fin = parseFloat(course.finalPrice || course.priceINR || "0");
    const disc = parseFloat(course.discountAmount || "0");
    const hasDiscount = (course.hasAssignedCoupon ?? false) && disc > 0;

    return { originalPrice: orig, displayPrice: fin, discountAmount: disc, hasDiscount };
  }, [course]);

  /* ---------------------------------------------------------
     Loading / error
  --------------------------------------------------------- */
  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) notFound();

  /* ---------------------------------------------------------
     Render – 100 % identical to original
  --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative py-12 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <Star className="w-3 h-3 fill-white" />
              Premium Course
            </div>

            <div className="space-y-4 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">{course.title}</h1>
              <p className="text-blue-100 leading-relaxed max-w-3xl">
                {getPlainText(course.tagline || course.description)}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-white/80 text-xs">Duration</div>
                    <div className="text-white font-semibold text-sm">
                      {course.duration || "Self-paced"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-white/80 text-xs">Students</div>
                    <div className="text-white font-semibold text-sm">
                      {course.currentEnrollments || "100"}+
                    </div>
                  </div>
                </div>
              </div>

              {course.totalSessions && (
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-white" />
                    <div>
                      <div className="text-white/80 text-xs">Sessions</div>
                      <div className="text-white font-semibold text-sm">{course.totalSessions}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-white/80 text-xs">Certificate</div>
                    <div className="text-white font-semibold text-sm">Included</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(course.relatedTopics || course.topics || []).slice(0, 3).map(t => (
                  <Badge key={t} className="bg-white/20 text-white border-0 px-3 py-1 text-xs">
                    {t}
                  </Badge>
                ))}
              </div>

              {!isEnrolled && !isAdminOrJyotishi && (
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Enroll Now - ₹{priceInfo?.displayPrice.toLocaleString("en-IN")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-gray-700 leading-relaxed">
                  <SafeHTML content={course.description} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Instructor</div>
                      <div className="text-gray-600 text-sm">{course.instructor || "Expert Instructor"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Duration</div>
                      <div className="text-gray-600 text-sm">{course.duration || "Flexible Schedule"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {course.features?.length ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.features.map((f, i) => {
                      const text = typeof f === "string" ? f : f.feature;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                          <span className="text-gray-800 text-sm">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Why Learn */}
            {course.whyLearn?.length ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Why Learn {course.title}
                  </CardTitle>
                  {course.whyLearnIntro && (
                    <div className="text-gray-600 text-sm mt-2">
                      <SafeHTML content={course.whyLearnIntro} />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {course.whyLearn.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`item-${i}`}
                        className="border border-gray-200 rounded-lg"
                      >
                        <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3 text-left">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{item.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 px-4 pb-4 text-sm">
                          <SafeHTML content={item.description} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : null}

            {/* Curriculum */}
            {(course.courseContent?.length || course.whatYouLearn) && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {course.courseContent?.length ? "Course Curriculum" : "What You'll Learn"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.courseContent?.length ? (
                    <div className="space-y-2">
                      {course.courseContent.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                          <span className="text-gray-800 text-sm">{c}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm">
                      <SafeHTML content={course.whatYouLearn!} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {isEnrolled ? (
              <Card className="border border-green-200 bg-green-50 sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Already Enrolled
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-green-800 text-sm">
                    You have successfully enrolled in this course. Head over to your dashboard to start learning!
                  </p>
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
                    <Link href="/dashboard/user/courses">Go to My Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : isAdminOrJyotishi ? (
              <Card className="border border-amber-200 bg-amber-50 sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-amber-900 flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Staff Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-amber-800 text-sm">
                    As {userRole?.toLowerCase()}, you have full access to this course.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg"
                  >
                    <Link
                      href={userRole === "ADMIN" ? "/dashboard/admin/courses" : "/dashboard/jyotishi/courses"}
                    >
                      Access Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200 shadow-sm rounded-xl sticky top-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                  <CardTitle className="text-xl font-bold text-white">
                    {course.enrollment?.title || "Enroll Now"}
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-sm mt-1">
                    {course.enrollment?.description || "Start your journey today"}
                  </CardDescription>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2 mb-3">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{priceInfo?.displayPrice.toLocaleString("en-IN")}
                        </span>
                        {priceInfo?.hasDiscount && (
                          <>
                            <span className="text-xl text-gray-500 line-through">
                              ₹{priceInfo.originalPrice.toLocaleString("en-IN")}
                            </span>
                            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                              Save ₹{priceInfo.discountAmount.toLocaleString("en-IN")}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-0"
                    >
                      Enroll Now - ₹{priceInfo?.displayPrice.toLocaleString("en-IN")}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Secure payment
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        30-day guarantee
                      </span>
                    </div>

                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-amber-900 text-sm">
                          {course.enrollment?.offer?.guarantee || "30-Day Money-Back Guarantee"}
                        </span>
                      </div>
                      <p className="text-amber-700 text-xs">Risk-free enrollment</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-bold text-blue-900 text-lg">{course.totalSessions || 10}+</div>
                        <div className="text-xs text-blue-700">Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-bold text-blue-900 text-lg">24/7</div>
                        <div className="text-xs text-blue-700">Support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      {!isEnrolled && !isAdminOrJyotishi && (
        <CheckoutSidebar
          course={{
            id: course.id,
            title: course.title,
            priceINR: course.priceINR || "0",
            slug: course.slug,
          }}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          appliedCoupons={course.appliedCoupons || []}
          hasAssignedCoupon={course.hasAssignedCoupon}
          finalPrice={course.finalPrice}
          originalPrice={course.originalPrice}
          discountAmount={course.discountAmount}
          adminDiscountAmount={course.adminDiscountAmount}
          jyotishiDiscountAmount={course.jyotishiDiscountAmount}
          priceAfterAdminDiscount={course.priceAfterAdminDiscount}
        />
      )}
    </div>
  );
}