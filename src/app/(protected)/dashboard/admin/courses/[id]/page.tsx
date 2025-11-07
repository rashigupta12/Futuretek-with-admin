"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  PlayCircle,
  Trash2,
  Users
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description: string;
  instructor?: string | null;
  duration?: string | null;
  totalSessions?: number | null;
  priceINR: string | number;
  priceUSD: string | number;
  status: string;
  thumbnailUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  registrationDeadline?: string | null;
  whyLearnIntro?: string | null;
  whatYouLearn?: string | null;
  disclaimer?: string | null;
  maxStudents?: number | null;
  currentEnrollments: number;
  createdAt: string;
  updatedAt: string;
  features?: { feature: string }[] | string[];
  whyLearn?: { title: string; description: string }[];
  content?: { content: string }[];
  topics?: { topic: string }[];
};

export default function ViewCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      const safeStatus = data.status ?? "DRAFT";
      const normalizedFeatures = Array.isArray(data.features)
        ? data.features.map((f: string | { feature: string }) =>
            typeof f === "string" ? { feature: f } : f
          )
        : [];

      setCourse({
        ...data,
        status: safeStatus,
        priceINR: data.priceINR ?? 0,
        priceUSD: data.priceUSD ?? 0,
        features: normalizedFeatures,
        whyLearn: Array.isArray(data.whyLearn) ? data.whyLearn : [],
        content: Array.isArray(data.content) ? data.content : [],
        topics: Array.isArray(data.topics) ? data.topics : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Course deleted successfully");
        router.push("/dashboard/courses");
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Error deleting course");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
    </div>
  );

  if (!course) return (
    <div className="container mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Course Not Found</h2>
      <Button asChild>
        <Link href="/dashboard/admin/courses">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Link>
      </Button>
    </div>
  );

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN") : "Not set";

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-500",
      REGISTRATION_OPEN: "bg-green-500",
      ONGOING: "bg-blue-500",
      UPCOMING: "bg-yellow-500",
      COMPLETED: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/admin/courses"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>
              <Badge variant="outline" className="text-xs">
                ADMIN VIEW
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              {course.title}
            </h1>
            {course.tagline && (
              <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {course.topics?.map((t) => (
                <Badge
                  key={t.topic}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {t.topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 leading-relaxed whitespace-pre-wrap">
                  {course.description || "No description provided."}
                </p>
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Instructor</div>
                      <div className="text-muted-foreground">
                        {course.instructor || "To be announced"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-muted-foreground">
                        {course.duration || "Not specified"}
                        {course.totalSessions && ` • ${course.totalSessions} sessions`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {course.features && course.features.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Course Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="leading-snug">{typeof f === 'string' ? f : f.feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Why Learn */}
            {(course.whyLearnIntro || (course.whyLearn && course.whyLearn.length > 0)) && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Why Learn {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.whyLearnIntro && (
                    <p  className="mb-6 leading-relaxed">{course.whyLearnIntro}</p>
                  )}
                  <Accordion type="single" collapsible className="w-full">
                    {course.whyLearn?.map((item, index) => (
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

            {/* Course Content */}
            {course.content && course.content.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Course Content</CardTitle>
                  <CardDescription>
                    {course.content.length} detailed lectures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {course.content.map((c, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 hover:bg-muted rounded-lg transition-colors group"
                      >
                        <BookOpen className="h-5 w-5 mt-1 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="leading-relaxed">{c.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing & Enrollment */}
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">Course Enrollment</CardTitle>
                <CardDescription>
                  {course.status === "REGISTRATION_OPEN"
                    ? "Registration is open"
                    : course.status === "DRAFT"
                    ? "Draft mode"
                    : "Check status"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                      ${Number(course.priceUSD).toLocaleString()}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-white ${getStatusColor(course.status)}`}
                    >
                      {course.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    ₹{Number(course.priceINR).toLocaleString("en-IN")}
                  </p>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{formatDate(course.startDate||"")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">{formatDate(course.endDate||"")}</span>
                    </div>
                    {course.maxStudents && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats</span>
                        <span className="font-medium">
                          {course.currentEnrollments}/{course.maxStudents}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Admin Actions */}
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        View Live Page
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start">
                      <Link href={`/dashboard/admin/courses/edit/${course.slug}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center italic">
                    Last updated: {new Date(course.updatedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{course.slug}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(course.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}