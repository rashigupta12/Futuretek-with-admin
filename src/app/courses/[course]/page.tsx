/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/courses/[course]/page.tsx
"use client";

import { BuyNowButton } from "@/components/checkout/BuyNowButton";
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
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  Star,
  Target,
  Users,
  Zap,
  IndianRupee,
  Award,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CourseData {
  appliedCoupon?: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: string;
  };
  finalPrice?: string;
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
   Fetch course (server-side cache) – unchanged
   ------------------------------------------------------------- */
async function getCourse(slug: string): Promise<CourseData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/courses/${slug}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch course");
    }

    const data = await response.json();
    const course = data.course;

    if (!course?.id) return null;

    // Normalise features
    if (course.features && Array.isArray(course.features)) {
      course.features = course.features.map((f: any) => {
        if (typeof f === "string") {
          try {
            const p = JSON.parse(f);
            return p.feature || f;
          } catch {
            return f;
          }
        }
        return f.feature || f;
      });
    }

    if (course.topics && !course.relatedTopics) {
      course.relatedTopics = course.topics;
    }

    return course;
  } catch (e) {
    console.error("Error fetching course:", e);
    return null;
  }
}

/* -------------------------------------------------------------
   Helper components
   ------------------------------------------------------------- */
function SafeHTML({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
  );
}
function getPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------
   MAIN PAGE COMPONENT
   ------------------------------------------------------------- */
export default function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = React.use(params);
  const { data: session, status: authStatus } = useSession();
  const userId = session?.user?.id as string | undefined;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  /* ---------------------------------------------------------
     1. Load course + enrollment status
     --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1. Course data (cached)
        const c = await getCourse(slug);
        if (!c) throw new Error("Course not found");
        setCourse(c);

        // 2. Enrollment check (only when logged-in)
        if (userId) {
          const res = await fetch("/api/user/enrollments");
          if (!res.ok) throw new Error("Failed to fetch enrollments");
          const { enrollments } = await res.json();

          const enrolled = Array.isArray(enrollments)
            ? enrollments.some(
                (e: any) =>
                  e.courseId === c.id &&
                  (e.status === "ACTIVE" || e.status === "COMPLETED")
              )
            : false;

          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (authStatus !== "loading") load();
  }, [slug, userId, authStatus]);

  /* ---------------------------------------------------------
     Loading / error states
     --------------------------------------------------------- */
  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    notFound();
  }

  /* ---------------------------------------------------------
     Icon resolver
     --------------------------------------------------------- */
  const getIcon = (iconName: string) => {
    const map: Record<string, any> = {
      Video: Clock,
      Award: CheckCircle2,
      Clock,
      Calendar,
      Users,
      Star,
      Target,
      Zap,
      Shield,
    };
    return map[iconName] ?? CheckCircle2;
  };

  /* ---------------------------------------------------------
     Render
     --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section - Modern Gradient */}
      <div className="relative py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto">
            {/* Premium Badge with Glow Effect */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/30 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              Premium Course
              <TrendingUp className="w-4 h-4" />
            </div>

            {/* Title Section */}
            <div className="space-y-6 mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                {course.title}
              </h1>
              <p className="text-lg lg:text-xl text-blue-50 leading-relaxed max-w-3xl">
                {getPlainText(course.tagline || course.description)}
              </p>
            </div>

            {/* Stats Grid - Glassmorphism Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/80 text-xs font-medium">Duration</div>
                    <div className="text-white font-semibold">{course.duration || "Self-paced"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/80 text-xs font-medium">Students</div>
                    <div className="text-white font-semibold">{course.currentEnrollments || "100+"}+</div>
                  </div>
                </div>
              </div>

              {course.totalSessions && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white/80 text-xs font-medium">Sessions</div>
                      <div className="text-white font-semibold">{course.totalSessions}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white/80 text-xs font-medium">Certificate</div>
                    <div className="text-white font-semibold">Included</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Topics and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {(course.relatedTopics || course.topics || [])
                  .slice(0, 4)
                  .map((t) => (
                    <Badge
                      key={t}
                      className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 transition-all duration-300 px-4 py-1.5 text-sm font-medium"
                    >
                      {t}
                    </Badge>
                  ))}
              </div>

              {!isEnrolled && (
                <Button 
                  onClick={() => setShowCheckout(true)}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 px-8 py-6 text-lg rounded-xl border-0"
                >
                  Enroll Now - ₹
                  {course.hasAssignedCoupon && course.finalPrice
                    ? parseFloat(course.finalPrice).toLocaleString("en-IN")
                    : parseFloat(course.priceINR || "0").toLocaleString("en-IN")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card - Modern Design */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-3xl font-bold flex items-center gap-4 text-gray-900">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
                  <SafeHTML content={course.description} />
                </div>
                
                {/* Instructor & Duration Cards */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg mb-1">Instructor</div>
                        <div className="text-gray-600 font-medium">{course.instructor || "Expert Instructor"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg mb-1">Duration</div>
                        <div className="text-gray-600 font-medium">{course.duration || "Flexible Schedule"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid - Modern Cards */}
            {course.features?.length ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6 border-b border-gray-100">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4 text-gray-900">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.features.map((f, i) => {
                      const text = typeof f === "string" ? f : f.feature;
                      return (
                        <div
                          key={i}
                          className="group relative overflow-hidden flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                        >
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-semibold text-gray-800 leading-snug pt-1">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Why Learn - Accordion */}
            {course.whyLearn?.length ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6 border-b border-gray-100">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4 text-gray-900">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                    Why Learn {course.title}
                  </CardTitle>
                  {course.whyLearnIntro && (
                    <div className="text-gray-600 prose prose-lg max-w-none mt-4">
                      <SafeHTML content={course.whyLearnIntro} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-8">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {course.whyLearn.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`item-${i}`}
                        className="border-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-blue-50/50 transition-colors">
                          <div className="flex items-center gap-4 text-left">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                              <Target className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900">{item.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 leading-relaxed px-6 pb-6 prose prose-lg max-w-none">
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
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-6 border-b border-gray-100">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4 text-gray-900">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                    {course.courseContent?.length ? "Course Curriculum" : "What You'll Learn"}
                  </CardTitle>
                  {course.courseContent?.length && (
                    <CardDescription className="text-gray-600 text-base mt-3">
                      Comprehensive curriculum with {course.courseContent.length} detailed modules
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-8">
                  {course.courseContent?.length ? (
                    <div className="space-y-3">
                      {course.courseContent.map((c, i) => (
                        <div
                          key={i}
                          className="group flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                        >
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 pt-1">
                            <span className="font-semibold text-gray-800 leading-relaxed">{c}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <SafeHTML content={course.whatYouLearn!} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <div className="lg:col-span-1">
            {isEnrolled ? (
              /* ---------- ENROLLED CARD ---------- */
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 sticky top-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
                <CardHeader className="text-white pb-6 relative">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    Already Enrolled
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 relative">
                  <p className="text-green-50 text-base leading-relaxed">
                    You have successfully enrolled in this course. Head over to your dashboard to start learning!
                  </p>
                  <Button
                    asChild
                    className="w-full bg-white text-green-600 hover:bg-green-50 font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/dashboard/user/courses">Go to My Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* ---------- ENROLLMENT CARD ---------- */
              <Card className="border-0 shadow-2xl bg-white sticky top-8 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
                  <div className="relative">
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {course.enrollment?.title || "Enroll Now"}
                    </CardTitle>
                    <CardDescription className="text-blue-100 text-base">
                      {course.enrollment?.description || "Start your journey today"}
                    </CardDescription>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Buy Now Component */}
                    <BuyNowButton
                      course={{
                        id: course.id,
                        title: course.title,
                        priceINR: course.priceINR || "0",
                        slug: course.slug,
                      }}
                      assignedCoupon={course?.appliedCoupon}
                      finalPrice={course.finalPrice}
                      hasAssignedCoupon={course.hasAssignedCoupon}
                    />

                    {/* Guarantee Badge */}
                    <div className="relative overflow-hidden text-center p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Shield className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="font-bold text-amber-900 text-base">
                          {course.enrollment?.offer?.guarantee || "30-Day Money-Back Guarantee"}
                        </span>
                      </div>
                      <p className="text-amber-700 text-sm font-medium">Risk-free enrollment</p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                        <div className="font-bold text-blue-900 text-2xl mb-1">
                          {course.totalSessions || 10}+
                        </div>
                        <div className="text-sm text-blue-700 font-medium">Sessions</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm">
                        <div className="font-bold text-purple-900 text-2xl mb-1">24/7</div>
                        <div className="text-sm text-purple-700 font-medium">Support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar for Hero Button */}
      {!isEnrolled && (
        <CheckoutSidebar
          course={{
            id: course.id,
            title: course.title,
            priceINR: course.priceINR || "0",
            slug: course.slug,
          }}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          assignedCoupon={course?.appliedCoupon}
          hasAssignedCoupon={course.hasAssignedCoupon}
          finalPrice={course.finalPrice}
        />
      )}
    </div>
  );
}