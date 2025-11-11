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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Compact */}
      <div className="relative py-12 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <Star className="w-3 h-3 fill-white" />
              Premium Course
            </div>

            {/* Title Section */}
            <div className="space-y-4 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                {course.title}
              </h1>
              <p className="text-blue-100 leading-relaxed max-w-3xl">
                {getPlainText(course.tagline || course.description)}
              </p>
            </div>

            {/* Stats Grid - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-white/80 text-xs">Duration</div>
                    <div className="text-white font-semibold text-sm">{course.duration || "Self-paced"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-white/80 text-xs">Students</div>
                    <div className="text-white font-semibold text-sm">{course.currentEnrollments || "100+"}+</div>
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

            {/* Topics and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(course.relatedTopics || course.topics || [])
                  .slice(0, 3)
                  .map((t) => (
                    <Badge
                      key={t}
                      className="bg-white/20 text-white border-0 px-3 py-1 text-xs"
                    >
                      {t}
                    </Badge>
                  ))}
              </div>

              {!isEnrolled && (
                <Button 
                  onClick={() => setShowCheckout(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 rounded-lg border-0"
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-gray-700 leading-relaxed">
                  <SafeHTML content={course.description} />
                </div>
                
                {/* Instructor & Duration */}
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

            {/* Features Grid */}
            {course.features?.length ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    What&apos;s Included
                  </CardTitle>
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

            {/* Why Learn - Accordion */}
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

          {/* ---------- SIDEBAR ---------- */}
          <div className="lg:col-span-1">
            {isEnrolled ? (
              /* ---------- ENROLLED CARD ---------- */
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
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
                  >
                    <Link href="/dashboard/user/courses">Go to My Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* ---------- ENROLLMENT CARD ---------- */
              <Card className="border border-gray-200 shadow-sm sticky top-6">
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
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-amber-900 text-sm">
                          {course.enrollment?.offer?.guarantee || "30-Day Money-Back Guarantee"}
                        </span>
                      </div>
                      <p className="text-amber-700 text-xs">Risk-free enrollment</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-bold text-blue-900 text-lg">
                          {course.totalSessions || 10}+
                        </div>
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