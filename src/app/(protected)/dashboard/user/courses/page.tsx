// src/app/(protected)/dashboard/user/courses/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Download,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RawEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  status: "ACTIVE" | "COMPLETED" | "PENDING";
  enrolledAt: string;
  completedAt?: string | null;
  certificateIssued: boolean;
  certificateUrl?: string | null;
  courseThumbnail?: string | null;
  // progress is **not** in the payload – we’ll calculate a fake one
}

export default function MyCoursesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [enrollments, setEnrollments] = useState<RawEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------------
     1. Fetch enrollments (same endpoint you already use)
     ------------------------------------------------------------- */
  useEffect(() => {
    async function fetchEnrollments() {
      if (!userId) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/user/enrollments`);
        if (!res.ok) throw new Error("Failed to load courses");

        const data = await res.json();
        // The API returns `enrollments: [...]` – flatten it
        setEnrollments(data.enrollments ?? []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [userId]);

  /* -------------------------------------------------------------
     2. Helpers
     ------------------------------------------------------------- */
  const getStatusBadge = (status: RawEnrollment["status"]) => {
    const cfg = {
      ACTIVE: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
      COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    };
    const { label, color } = cfg[status];
    return <Badge className={color}>{label}</Badge>;
  };

  // Fake progress – you can replace with real data later
  const fakeProgress = (status: string) => {
    if (status === "COMPLETED") return 100;
    if (status === "PENDING") return 0;
    return Math.floor(Math.random() * 70) + 15; // 15-85%
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /* -------------------------------------------------------------
     3. Render states
     ------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Error</h3>
          <p className="text-gray-600 mt-1">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Courses Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your learning journey by enrolling in a course!
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     4. Main UI
     ------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-1">
          Continue learning and track your progress
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const isCompleted = enrollment.status === "COMPLETED";
          const progress = fakeProgress(enrollment.status);
          const hasCertificate = enrollment.certificateIssued && enrollment.certificateUrl;

          return (
            <Card
              key={enrollment.id}
              className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Thumbnail (optional) */}
              {enrollment.courseThumbnail ? (
                <div className="h-40 rounded-t-lg overflow-hidden bg-gray-100">
                  <img
                    src={enrollment.courseThumbnail}
                    alt={enrollment.courseTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-indigo-600 opacity-30" />
                </div>
              )}

              <CardHeader className="pb-4 flex-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {enrollment.courseTitle}
                  </CardTitle>
                  {getStatusBadge(enrollment.status)}
                </div>

                <CardDescription className="mt-2 text-sm text-gray-600">
                  Enrolled on {formatDate(enrollment.enrolledAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Certificate info */}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-sm">
                    {hasCertificate ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Certificate Issued
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-700">
                          Certificate pending
                        </span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t bg-gray-50 flex gap-2">
                {/* Primary CTA */}
                {/* <Button
                  asChild
                  className={`flex-1 ${
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Link href={`/courses/${enrollment.courseTitle.toLowerCase()}`}>
                    {isCompleted ? (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        View Course
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Learning
                      </>
                    )}
                  </Link>
                </Button> */}

                {/* Certificate download (only if issued) */}
                {hasCertificate && (
                  <Button asChild variant="outline" size="icon">
                    <a
                      href={enrollment.certificateUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download Certificate"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}