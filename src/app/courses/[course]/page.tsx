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
import { Clock, BookOpen, CheckCircle2, Users, Calendar } from "lucide-react";
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
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/admin/courses/${slug}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching for debugging
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      // const errorText = await response.text();
      throw new Error("Failed to fetch course");
    }

    const data = await response.json();

    // The API returns the course directly, not wrapped
    const course = data;

    if (!course || !course.id) {
      return null;
    }

    // Parse features if they're JSON strings
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

    // Map topics to relatedTopics
    if (course.topics && !course.relatedTopics) {
      course.relatedTopics = course.topics;
    }

    return course;
  } catch (error) {
    console.error("💥 Error fetching course:", error);
    return null;
  }
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
    };
    return icons[iconName as keyof typeof icons] || Clock;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              {courseData.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {courseData.tagline || courseData.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(courseData.relatedTopics || courseData.topics || []).map(
                (topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {topic}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 leading-relaxed">{courseData.description}</p>
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Instructor</div>
                      <div className="text-muted-foreground">
                        {courseData.instructor || "To be announced"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-muted-foreground">
                        {courseData.duration || "To be announced"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {courseData.features && courseData.features.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Course Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {courseData.features.map((feature, index) => {
                      const text =
                        typeof feature === "string" ? feature : feature.feature;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="leading-snug">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {courseData.whyLearn && courseData.whyLearn.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Why Learn {courseData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseData.whyLearnIntro && (
                    <p className="mb-6 leading-relaxed">
                      {courseData.whyLearnIntro}
                    </p>
                  )}
                  <Accordion type="single" collapsible className="w-full">
                    {courseData.whyLearn.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:text-purple-500 transition-colors">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {((courseData.courseContent &&
              courseData.courseContent.length > 0) ||
              courseData.whatYouLearn) && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {courseData.courseContent &&
                    courseData.courseContent.length > 0
                      ? "Course Content"
                      : "What You'll Learn"}
                  </CardTitle>
                  {courseData.courseContent &&
                    courseData.courseContent.length > 0 && (
                      <CardDescription>
                        Comprehensive curriculum with{" "}
                        {courseData.courseContent.length} detailed lectures
                      </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                  {courseData.courseContent &&
                  courseData.courseContent.length > 0 ? (
                    <div className="grid gap-3">
                      {courseData.courseContent.map((content, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 hover:bg-muted rounded-lg transition-colors group"
                        >
                          <BookOpen className="h-5 w-5 mt-1 text-purple-500 group-hover:scale-110 transition-transform" />
                          <span className="leading-relaxed">{content}</span>
                        </div>
                      ))}
                    </div>
                  ) : courseData.whatYouLearn ? (
                    <div className="prose prose-sm max-w-none">
                      {courseData.whatYouLearn
                        .split("\n\n")
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className="mb-4 leading-relaxed text-muted-foreground"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">
                  {courseData.enrollment?.title ||
                    `Enroll in ${courseData.title}`}
                </CardTitle>
                <CardDescription>
                  {courseData.enrollment?.description ||
                    `Master ${courseData.title}`}
                </CardDescription>
              </CardHeader>
    <CardContent className="p-6">
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        {courseData.priceINR
          ? `₹${parseFloat(courseData.priceINR).toLocaleString("en-IN")}`
          : "Contact for pricing"}
      </span>
      <Badge
        variant="secondary"
        className="bg-purple-500/10 text-purple-500"
      >
        {courseData.enrollment?.offer?.badge ||
          courseData.status ||
          "Limited Seats"}
      </Badge>
    </div>

    {courseData.enrollment?.features ? (
      <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
        {courseData.enrollment.features.map((feature, index) => {
          const IconComponent = getIcon(feature.icon);
          return (
            <div key={index} className="flex items-center gap-3">
              <IconComponent className="h-5 w-5 text-purple-500" />
              <span className="text-sm">{feature.text}</span>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-purple-500" />
          <span className="text-sm">
            {courseData.duration || "Self-paced learning"}
          </span>
        </div>
        {courseData.totalSessions && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span className="text-sm">
              {courseData.totalSessions} Sessions
            </span>
          </div>
        )}
        {courseData.currentEnrollments !== undefined && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm">
              {courseData.currentEnrollments} Students Enrolled
            </span>
          </div>
        )}
      </div>
    )}
    <BuyNowButton 
      course={{
        id: courseData.id,
        title: courseData.title,
        priceINR: courseData.priceINR || "0",
        slug: courseData.slug
      }}
    />

    <p className="text-sm text-muted-foreground text-center italic">
      {courseData.enrollment?.offer?.guarantee ||
        "100% Satisfaction Guarantee"}
    </p>
  </div>
</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
