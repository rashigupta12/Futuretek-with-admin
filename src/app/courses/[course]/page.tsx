/*eslint-disable @typescript-eslint/no-explicit-any */
// src/app/courses/[course]/page.tsx
"use client";

import { BuyNowButton } from "@/components/checkout/BuyNowButton";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      {/* Hero */}
      <div className="relative py-12 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl">
            {/* Compact Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Star className="w-3 h-3" />
              Premium Course
            </div>

            {/* Title and Tagline */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-base text-blue-100 leading-relaxed max-w-2xl line-clamp-2">
                  {getPlainText(course.tagline || course.description)}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-2">
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {course.duration || "Self-paced"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {course.currentEnrollments || "100+"} students
                  </span>
                </div>
                {course.totalSessions && (
                  <div className="flex items-center gap-2 text-white/90">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">
                      {course.totalSessions} sessions
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Topics and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="flex flex-wrap gap-2">
                {(course.relatedTopics || course.topics || [])
                  .slice(0, 3)
                  .map((t) => (
                    <Badge
                      key={t}
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 border-0 text-xs"
                    >
                      {t}
                    </Badge>
                  ))}
              </div>

              {/* Hero CTA Button */}
              {!isEnrolled && (
                <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Enroll Now - ₹
                  {course.hasAssignedCoupon && course.finalPrice
                    ? parseFloat(course.finalPrice).toLocaleString("en-IN")
                    : parseFloat(course.priceINR || "0").toLocaleString(
                        "en-IN"
                      )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---------- MAIN CONTENT ---------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-gray-700 leading-relaxed prose prose-lg max-w-none">
                  <SafeHTML content={course.description} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Instructor
                      </div>
                      <div className="text-gray-600">
                        {course.instructor || "Expert Instructor"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Duration
                      </div>
                      <div className="text-gray-600">
                        {course.duration || "Flexible Schedule"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {course.features?.length ? (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.features.map((f, i) => {
                      const text = typeof f === "string" ? f : f.feature;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50 transition-all duration-300 group border border-gray-100 hover:border-blue-200"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-800 leading-snug">
                            {text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Why Learn */}
            {course.whyLearn?.length ? (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                    Why Learn {course.title}
                  </CardTitle>
                  {course.whyLearnIntro && (
                    <div className="text-gray-600 prose prose-lg max-w-none">
                      <SafeHTML content={course.whyLearnIntro} />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                  >
                    {course.whyLearn.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`item-${i}`}
                        className="border border-gray-200 rounded-lg px-4 hover:border-blue-200 transition-colors"
                      >
                        <AccordionTrigger className="hover:text-blue-600 transition-colors py-4 font-semibold">
                          <div className="flex items-center gap-3 text-left">
                            <Target className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            {item.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 leading-relaxed pb-4 prose prose-lg max-w-none">
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
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                    {course.courseContent?.length
                      ? "Course Curriculum"
                      : "What You'll Learn"}
                  </CardTitle>
                  {course.courseContent?.length && (
                    <CardDescription className="text-gray-600">
                      Comprehensive curriculum with{" "}
                      {course.courseContent.length} detailed modules
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {course.courseContent?.length ? (
                    <div className="space-y-3">
                      {course.courseContent.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-all duration-300 group border border-gray-100 hover:border-blue-200"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform mt-1">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 leading-relaxed">
                              {c}
                            </span>
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
              <Card className="border border-green-200 shadow-lg bg-gradient-to-b from-green-50 to-green-100/50 sticky top-8">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg text-white pb-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Already Enrolled
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-700 text-sm">
                    You have successfully enrolled in this course. Head over to
                    your dashboard to start learning!
                  </p>
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Link href="/dashboard/user/courses">Go to My Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* ---------- ENROLLMENT CARD ---------- */
              <Card className="border border-gray-200 shadow-lg bg-white sticky top-8">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg text-white pb-6">
                  <CardTitle className="text-xl font-bold">
                    {course.enrollment?.title || "Enroll Now"}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {course.enrollment?.description ||
                      "Start your journey today"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {course.hasAssignedCoupon && course.finalPrice ? (
                          <>
                            <span className="text-3xl font-bold text-gray-900">
                              ₹
                              {parseFloat(course.finalPrice).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                            <span className="text-xl text-gray-500 line-through">
                              ₹
                              {parseFloat(
                                course.priceINR || "0"
                              ).toLocaleString("en-IN")}
                            </span>
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                              Special Offer
                            </Badge>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">
                            {course.priceINR
                              ? `₹${parseFloat(course.priceINR).toLocaleString(
                                  "en-IN"
                                )}`
                              : "Contact Us"}
                          </span>
                        )}
                      </div>
                      {course.priceINR && (
                        <p className="text-gray-600 text-sm">
                          One-time payment
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {course.enrollment?.features ? (
                        course.enrollment.features.map((f, i) => {
                          const Icon = getIcon(f.icon);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {f.text}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800 text-sm">
                              {course.duration || "Lifetime Access"}
                            </span>
                          </div>
                          {course.totalSessions && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-amber-600" />
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {course.totalSessions} Live Sessions
                              </span>
                            </div>
                          )}
                          {course.currentEnrollments !== undefined && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {course.currentEnrollments}+ Students Enrolled
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Buy Now */}
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

                    {/* Guarantee */}
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-amber-800 text-sm">
                          {course.enrollment?.offer?.guarantee ||
                            "30-Day Money-Back Guarantee"}
                        </span>
                      </div>
                      <p className="text-amber-600 text-xs">
                        Risk-free enrollment
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="font-bold text-gray-900 text-sm">
                          {course.totalSessions || 10}+
                        </div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="font-bold text-gray-900 text-sm">
                          24/7
                        </div>
                        <div className="text-xs text-gray-600">Support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
