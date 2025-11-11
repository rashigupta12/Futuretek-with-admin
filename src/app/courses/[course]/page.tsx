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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Users,
  Calendar,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { notFound } from "next/navigation";
import { BuyNowButton } from "@/components/checkout/BuyNowButton";

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
  whyLearn?: Array<{
    title: string;
    description: string;
  }>;
  whyLearnIntro?: string;
  whatYouLearn?: string;
  courseContent?: string[];
  topics?: string[];
  relatedTopics?: string[];
  enrollment?: {
    title: string;
    description: string;
    offer: {
      badge: string;
      guarantee: string;
    };
    features: Array<{
      icon: string;
      text: string;
    }>;
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
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch course");
    }

    const data = await response.json();
    const course = data.course;
    if (!course?.id) return null;

    if (course.features && Array.isArray(course.features)) {
      course.features = course.features.map(
        (f: string | { feature: string }) => {
          if (typeof f === "string") {
            try {
              const parsed = JSON.parse(f);
              return parsed.feature || f;
            } catch {
              return f;
            }
          }
          return f.feature || f;
        }
      );
    }

    if (course.topics && !course.relatedTopics) {
      course.relatedTopics = course.topics;
    }

    return course;
  } catch (error) {
    console.error("💥 Error fetching course:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/20">
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

  const getIcon = (iconName: string) => {
    const icons = {
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
    return icons[iconName as keyof typeof icons] || CheckCircle2;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      {/* Enhanced Hero Section with Blue & Golden Theme */}
      <div className="relative py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm text-yellow-100 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-yellow-400/30">
              <Star className="w-4 h-4" />
              Transform Your Astrological Knowledge
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl">
              {getPlainText(courseData.tagline || courseData.description)}
            </p>
            <div className="flex flex-wrap gap-3">
              {(courseData.relatedTopics || courseData.topics || []).map(
                (topic) => (
                  <Badge
                    key={topic}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 backdrop-blur-sm transition-all duration-300 border border-yellow-400/30"
                  >
                    {topic}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed text-slate-700 prose prose-lg max-w-none">
                  <SafeHTML content={courseData.description} />
                </div>
                <div className="grid sm:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
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
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
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

            {/* Course Features */}
            {courseData.features && courseData.features.length > 0 && (
              <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                    <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></div>
                    What&apos;s Included{" "}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {courseData.features.map((feature, index) => {
                      const text =
                        typeof feature === "string" ? feature : feature.feature;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300 group border border-slate-100 hover:border-yellow-200"
                        >
                          <div className="p-2 bg-yellow-100 rounded-lg group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-yellow-600" />
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
            )}

            {/* Why Learn Section */}
            {courseData.whyLearn && courseData.whyLearn.length > 0 && (
              <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                    Why Learn {courseData.title}
                  </CardTitle>
                  {courseData.whyLearnIntro && (
                    <div className="text-lg text-slate-600 prose prose-lg max-w-none">
                      <SafeHTML content={courseData.whyLearnIntro} />
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
                        key={index}
                        value={`item-${index}`}
                        className="border border-slate-200 rounded-xl px-4 hover:border-blue-200 transition-colors"
                      >
                        <AccordionTrigger className="hover:text-blue-600 transition-colors py-4 text-lg font-semibold text-slate-800">
                          <div className="flex items-center gap-3 text-left">
                            <Target className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            {item.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-700 leading-relaxed text-lg pb-4 prose prose-lg max-w-none">
                          <SafeHTML content={item.description} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            {((courseData.courseContent &&
              courseData.courseContent.length > 0) ||
              courseData.whatYouLearn) && (
              <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                    {course.courseContent?.length
                      ? "Course Curriculum"
                      : "What You'll Learn"}
                  </CardTitle>
                  {course.courseContent?.length && (
                    <CardDescription className="text-lg">
                      Comprehensive curriculum with{" "}
                      {course.courseContent.length} detailed modules
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {courseData.courseContent &&
                  courseData.courseContent.length > 0 ? (
                    <div className="space-y-3">
                      {courseData.courseContent.map((content, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group border border-slate-100 hover:border-blue-200"
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
                  ) : courseData.whatYouLearn ? (
                    <div className="prose prose-lg max-w-none text-slate-700">
                      <SafeHTML content={courseData.whatYouLearn} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar with Blue & Golden Theme */}
          <div className="lg:col-span-1">
            {isEnrolled ? (
              /* ---------- ENROLLED CARD ---------- */
              <Card className="border-0 shadow-2xl bg-gradient-to-b from-green-50 to-emerald-50 sticky top-8">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl text-white pb-6">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-7 w-7" />
                    Already Enrolled
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-700">
                    You have successfully enrolled in this course. Head over to
                    your dashboard to start learning!
                  </p>
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Link href="/dashboard/courses">Go to My Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* ---------- BUY NOW CARD (original) ---------- */
              <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-b from-white to-gray-50/50 sticky top-8">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl text-white pb-6">
                  <CardTitle className="text-2xl font-bold">
                    {course.enrollment?.title || "Enroll Now"}
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    {course.enrollment?.description ||
                      "Start your journey today"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {course.priceINR
                            ? `₹${parseFloat(course.priceINR).toLocaleString(
                                "en-IN"
                              )}`
                            : "Contact Us"}
                        </span>
                        {course.priceINR && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-sm py-1">
                            Best Value
                          </Badge>
                        )}
                      </div>
                      {course.priceINR && (
                        <p className="text-gray-600 text-sm">
                          One-time payment
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      {course.enrollment?.features ? (
                        course.enrollment.features.map((f, i) => {
                          const Icon = getIcon(f.icon);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Icon className="h-5 w-5 text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {f.text}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-slate-800 text-sm">
                              {courseData.totalSessions} Live Sessions
                            </span>
                          </div>
                        )}
                        {courseData.currentEnrollments !== undefined && (
                          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Users className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="font-medium text-slate-800 text-sm">
                              {courseData.currentEnrollments}+ Students Enrolled
                            </span>
                          </div>
                        )}
                      </div>
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
                      assignedCoupon={course.appliedCoupon} // Now this matches the interface
                      finalPrice={course.finalPrice}
                      hasAssignedCoupon={course.hasAssignedCoupon}
                    />

                    {/* Guarantee */}
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800 text-sm">
                          {course.enrollment?.offer?.guarantee ||
                            "30-Day Money-Back Guarantee"}
                        </span>
                      </div>
                      <p className="text-green-600 text-xs">
                        Risk-free enrollment
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-gray-900">
                          {course.totalSessions || 10}+
                        </div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                      <div className="text-xs text-blue-600">Sessions</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="font-bold text-yellow-900">24/7</div>
                      <div className="text-xs text-yellow-600">Support</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
