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
  // progress is **not** in the payload – we'll calculate a fake one
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
      ACTIVE: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200" },
      COMPLETED: { label: "Completed", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      PENDING: { label: "Pending", color: "bg-slate-100 text-slate-600 border-slate-200" },
    };
    const { label, color } = cfg[status];
    return <Badge className={`${color} border`}>{label}</Badge>;
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
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Error</h3>
          <p className="text-slate-600 mt-1">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-200">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            No Courses Yet
          </h3>
          <p className="text-slate-600 mb-6">
            Start your learning journey by enrolling in a course!
          </p>
          <Button 
            asChild 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
          >
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
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-yellow-500 rounded-full"></div>
        <div className="pl-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-slate-600 mt-1">
            Continue learning and track your progress
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const isCompleted = enrollment.status === "COMPLETED";
          const progress = fakeProgress(enrollment.status);
          const hasCertificate = enrollment.certificateIssued && enrollment.certificateUrl;

          return (
            <Card
              key={enrollment.id}
              className="border border-blue-100 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col relative overflow-hidden group"
            >
              {/* Golden top accent for completed courses */}
              {isCompleted && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              )}

              {/* Thumbnail */}
              {enrollment.courseThumbnail ? (
                <div className="h-40 overflow-hidden bg-slate-100">
                  <img
                    src={enrollment.courseThumbnail}
                    alt={enrollment.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-blue-100 via-blue-50 to-yellow-50 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-blue-600 opacity-20" />
                </div>
              )}

              <CardHeader className={`pb-4 flex-1 ${isCompleted ? 'pt-5' : 'pt-4'}`}>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2 text-blue-900">
                    {enrollment.courseTitle}
                  </CardTitle>
                  {getStatusBadge(enrollment.status)}
                </div>

                <CardDescription className="mt-2 text-sm text-slate-600">
                  Enrolled on {formatDate(enrollment.enrolledAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-blue-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Certificate info */}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-sm pt-2">
                    {hasCertificate ? (
                      <>
                        <div className="p-1 bg-yellow-100 rounded">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span className="text-yellow-700 font-medium">
                          Certificate Issued
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-orange-100 rounded">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-orange-700 font-medium">
                          Certificate pending
                        </span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent flex gap-2">
                {/* Certificate download (only if issued) */}
                {hasCertificate && (
                  <Button 
                    asChild 
                    variant="outline" 
                    size="icon"
                    className="border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800"
                  >
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