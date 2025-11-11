/*eslint-disable @typescript-eslint/no-explicit-any*/
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  Star,
  TrendingUp
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  status:
    | 'REGISTRATION_OPEN'
    | 'COMPLETED'
    | 'DRAFT'
    | 'UPCOMING'
    | 'ONGOING'
    | 'ARCHIVED';
  priceINR: number;
  priceUSD: number;
  currentEnrollments: number;
}

export function CoursesCatalog() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string | undefined;

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const coursesRes = await fetch('/api/admin/courses');
        if (!coursesRes.ok) throw new Error(`HTTP ${coursesRes.status}`);
        const { courses: rawCourses } = await coursesRes.json();

        let enrolledIds = new Set<string>();
        if (userId) {
          const enrollRes = await fetch(`/api/user/enrollments`);
          if (enrollRes.ok) {
            const { enrollments } = await enrollRes.json();
            if (Array.isArray(enrollments)) {
              enrolledIds = new Set(
                enrollments
                  .filter(
                    (e: any) =>
                      e.status === 'ACTIVE' ||
                      e.status === 'COMPLETED'
                  )
                  .map((e: any) => e.courseId)
              );
            }
          }
        }

        setCourses(rawCourses ?? []);
        setEnrolledCourseIds(enrolledIds);
      } catch (err) {
        console.error('Catalog load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      fetchData();
    }
  }, [userId, status]);

  const getPlainText = (html: string) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const getStatusBadge = (status: Course['status']) => {
    const cfg: Record<
      Course['status'],
      { label: string; color: string; icon?: React.ReactNode }
    > = {
      REGISTRATION_OPEN: {
        label: 'Enrolling Now',
        color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm',
        icon: <TrendingUp className="h-3 w-3" />,
      },
      UPCOMING: {
        label: 'Coming Soon',
        color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
        icon: <Clock className="h-3 w-3" />,
      },
      ONGOING: {
        label: 'In Progress',
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm',
        icon: <BookOpen className="h-3 w-3" />,
      },
      COMPLETED: {
        label: 'Completed',
        color: 'bg-slate-100 text-slate-700 border border-slate-300',
      },
      DRAFT: {
        label: 'Draft',
        color: 'bg-slate-100 text-slate-700 border border-slate-300',
      },
      ARCHIVED: {
        label: 'Archived',
        color: 'bg-slate-100 text-slate-700 border border-slate-300',
      },
    };
    const { label, color, icon } = cfg[status] ?? cfg.DRAFT;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${color}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
            <p className="text-slate-600 font-semibold">Loading courses...</p>
            <p className="text-sm text-slate-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-2 border-red-100 p-12 shadow-lg">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Unable to Load Courses</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-slate-900 hover:bg-slate-800 px-6 py-3 h-auto text-white">
              <ArrowRight className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-2 border-slate-200 p-12 shadow-lg">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Courses Available Yet</h3>
            <p className="text-slate-600 mb-1">Check back soon for new courses!</p>
            <p className="text-sm text-slate-500">We&apos;re preparing something amazing for you.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-blue-100">
            <Star className="h-4 w-4" />
            <span>Our Courses</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Featured Courses
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Master ancient sciences with our comprehensive curriculum designed by expert practitioners
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {courses.map((course) => {
            const isEnrolled = userId ? enrolledCourseIds.has(course.id) : false;

            return (
              <Card
                key={course.id}
                className="flex flex-col group hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white hover:border-blue-300 overflow-hidden relative hover:-translate-y-1"
              >
                {/* Golden Top Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>

                <CardHeader className="pb-4 pt-6 relative">
                  {getStatusBadge(course.status)}
                  <CardTitle className="line-clamp-2 text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight mt-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <CardDescription className="line-clamp-3 text-slate-600 leading-relaxed text-sm mb-6">
                    {getPlainText(course.description)}
                  </CardDescription>

                  <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          <IndianRupee className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold">INR</span>
                      </div>
                      <span className="font-bold text-slate-900 text-base">
                        ₹{course.priceINR?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                  <div className="flex gap-4 w-full">
                    {/* Learn More */}
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 h-10 font-semibold"
                    >
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex items-center justify-center gap-2"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>

                    {/* Enroll / Enrolled */}
                    {isEnrolled ? (
                      <Button
                        disabled
                        size="sm"
                        variant="outline"
                        className="flex-1 border border-green-300 text-green-700 bg-green-50 cursor-not-allowed h-10 font-medium flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-10 font-medium"
                      >
                        <Link href="/auth/login">Enroll Now</Link>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* View All */}
        {/* <div className="text-center">
          <Button
            asChild
            variant="outline"
            className="border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 px-6 py-3 h-auto font-semibold text-base group shadow-sm hover:shadow-md"
          >
            <Link href="/courses" className="flex items-center gap-3">
              Explore All Courses
              <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
          </Button>
        </div> */}
      </div>
    </section>
  );
}