// src/app/courses/[course]/page.tsx
import React from "react";
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
import { Clock, BookOpen, CheckCircle2, Users, Calendar, Star, Target, Zap, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface CourseData {
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

async function getCourse(slug: string): Promise<CourseData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/admin/courses/${slug}`;

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
    const course = data;

    if (!course || !course.id) {
      return null;
    }

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

// Helper function to safely render HTML content
function SafeHTML({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}

// Helper function to clean and extract plain text from HTML
function getPlainText(htmlContent: string): string {
  if (!htmlContent) return '';
  
  // Remove HTML tags and extract text
  const text = htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  return text;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  const courseData = await getCourse(course);

  if (!courseData) {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/20">
      {/* Enhanced Hero Section */}
      <div className="relative py-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Transform Your Astrological Knowledge
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {courseData.title}
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl">
              {getPlainText(courseData.tagline || courseData.description)}
            </p>
            <div className="flex flex-wrap gap-3">
              {(courseData.relatedTopics || courseData.topics || []).map(
                (topic) => (
                  <Badge
                    key={topic}
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 border-0"
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  Course Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed text-gray-700 prose prose-lg max-w-none">
                  <SafeHTML content={courseData.description} />
                </div>
                <div className="grid sm:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Instructor</div>
                      <div className="text-gray-600">
                        {courseData.instructor || "Expert Instructor"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Duration</div>
                      <div className="text-gray-600">
                        {courseData.duration || "Flexible Schedule"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Features */}
            {courseData.features && courseData.features.length > 0 && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {courseData.features.map((feature, index) => {
                      const text = typeof feature === "string" ? feature : feature.feature;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition-all duration-300 group border border-transparent hover:border-green-100"
                        >
                          <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-800 leading-snug">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Why Learn Section */}
            {courseData.whyLearn && courseData.whyLearn.length > 0 && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    Why Learn {courseData.title}
                  </CardTitle>
                  {courseData.whyLearnIntro && (
                    <div className="text-lg text-gray-600 prose prose-lg max-w-none">
                      <SafeHTML content={courseData.whyLearnIntro} />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {courseData.whyLearn.map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`item-${index}`}
                        className="border border-gray-200 rounded-xl px-4 hover:border-orange-200 transition-colors"
                      >
                        <AccordionTrigger className="hover:text-orange-600 transition-colors py-4 text-lg font-semibold">
                          <div className="flex items-center gap-3 text-left">
                            <Target className="h-5 w-5 text-orange-500 flex-shrink-0" />
                            {item.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 leading-relaxed text-lg pb-4 prose prose-lg max-w-none">
                          <SafeHTML content={item.description} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            {((courseData.courseContent && courseData.courseContent.length > 0) || courseData.whatYouLearn) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                    {courseData.courseContent && courseData.courseContent.length > 0
                      ? "Course Curriculum"
                      : "What You'll Learn"}
                  </CardTitle>
                  {courseData.courseContent && courseData.courseContent.length > 0 && (
                    <CardDescription className="text-lg">
                      Comprehensive curriculum with {courseData.courseContent.length} detailed modules
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {courseData.courseContent && courseData.courseContent.length > 0 ? (
                    <div className="space-y-3">
                      {courseData.courseContent.map((content, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 group border border-transparent hover:border-indigo-100"
                        >
                          <div className="p-2 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform mt-1">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 leading-relaxed">{content}</span>
                          </div>
                          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : courseData.whatYouLearn ? (
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <SafeHTML content={courseData.whatYouLearn} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-b from-white to-gray-50/50 sticky top-8">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl text-white pb-6">
                <CardTitle className="text-2xl font-bold">
                  {courseData.enrollment?.title || `Enroll Now`}
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  {courseData.enrollment?.description || `Start your journey today`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Price Section */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {courseData.priceINR
                          ? `₹${parseFloat(courseData.priceINR).toLocaleString("en-IN")}`
                          : "Contact Us"}
                      </span>
                      {courseData.priceINR && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-sm py-1">
                          Best Value
                        </Badge>
                      )}
                    </div>
                    {courseData.priceINR && (
                      <p className="text-gray-600 text-sm">One-time payment</p>
                    )}
                  </div>

                  {/* Key Features */}
                  <div className="space-y-4">
                    {courseData.enrollment?.features ? (
                      courseData.enrollment.features.map((feature, index) => {
                        const IconComponent = getIcon(feature.icon);
                        return (
                          <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <IconComponent className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-800 text-sm">{feature.text}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-800 text-sm">
                            {courseData.duration || "Lifetime Access"}
                          </span>
                        </div>
                        {courseData.totalSessions && (
                          <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-800 text-sm">
                              {courseData.totalSessions} Live Sessions
                            </span>
                          </div>
                        )}
                        {courseData.currentEnrollments !== undefined && (
                          <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <span className="font-medium text-gray-800 text-sm">
                              {courseData.currentEnrollments}+ Students Enrolled
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Buy Now Button */}
                  <BuyNowButton 
                    course={{
                      id: courseData.id,
                      title: courseData.title,
                      priceINR: courseData.priceINR || "0",
                      slug: courseData.slug
                    }}
                  />

                  {/* Guarantee */}
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800 text-sm">
                        {courseData.enrollment?.offer?.guarantee || "30-Day Money-Back Guarantee"}
                      </span>
                    </div>
                    <p className="text-green-600 text-xs">
                      Risk-free enrollment
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900">{courseData.totalSessions || 10}+</div>
                      <div className="text-xs text-gray-600">Sessions</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900">24/7</div>
                      <div className="text-xs text-gray-600">Support</div>
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