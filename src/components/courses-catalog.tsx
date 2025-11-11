'use client';

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Users, Clock, IndianRupee, DollarSign, Loader2, AlertCircle, BookOpen, ArrowRight, Star, TrendingUp } from 'lucide-react'

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: 'REGISTRATION_OPEN' | 'COMPLETED' | 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'ARCHIVED';
  priceINR: number;
  priceUSD: number;
  currentEnrollments: number;
}

export function CoursesCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/courses');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to strip HTML tags and get plain text
  const getPlainText = (html: string) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Get status badge color
  const getStatusBadge = (status: Course['status']) => {
    const statusConfig = {
      REGISTRATION_OPEN: { 
        label: 'Enrolling Now', 
        color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm',
        icon: <TrendingUp className="h-3 w-3" />
      },
      UPCOMING: { 
        label: 'Coming Soon', 
        color: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm',
        icon: <Clock className="h-3 w-3" />
      },
      ONGOING: { 
        label: 'In Progress', 
        color: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm',
        icon: <BookOpen className="h-3 w-3" />
      },
      COMPLETED: { 
        label: 'Completed', 
        color: 'bg-gray-100 text-gray-700 border border-gray-300',
        icon: null
      },
      DRAFT: { 
        label: 'Draft', 
        color: 'bg-gray-100 text-gray-700 border border-gray-300',
        icon: null
      },
      ARCHIVED: { 
        label: 'Archived', 
        color: 'bg-gray-100 text-gray-700 border border-gray-300',
        icon: null
      }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-2 border-red-100 p-12 shadow-lg">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Courses</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={fetchCourses} className="bg-gray-900 hover:bg-gray-800 px-6 py-3 h-auto">
              <ArrowRight className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
            <p className="text-gray-600 font-semibold">Loading courses...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-3xl border-2 border-gray-200 p-12 shadow-lg">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Available Yet</h3>
            <p className="text-gray-600 mb-1">Check back soon for new courses!</p>
            <p className="text-sm text-gray-500">We're preparing something amazing for you.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>Our Courses</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Master ancient sciences with our comprehensive curriculum designed by expert practitioners
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="flex flex-col group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 bg-white hover:border-blue-300 overflow-hidden relative hover:-translate-y-1"
            >
              {/* Gradient Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardHeader className="pb-4 pt-6 relative">
                <CardTitle className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                  {course.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed text-sm mb-6">
                  {getPlainText(course.description)}
                </CardDescription>
                
                {/* Course Stats */}
                <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <IndianRupee className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold">INR</span>
                    </div>
                    <span className="font-bold text-gray-900 text-base">₹{course.priceINR?.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{course.currentEnrollments || 0}</span>
                      <span className="text-gray-500">enrolled</span>
                    </div>
                  </div> */}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2 pt-4 border-t-2 border-gray-100">
                <div className='flex gap-4'>
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-10 font-semibold">
                  <Link href={`/courses/${course.slug}`} className="flex items-center justify-center gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-10 font-medium"
                >
                  <Link href="/auth/login">
                    Enroll Now
                  </Link>
                </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 px-4 py-2 h-auto font-semibold text-base group shadow-sm hover:shadow-md"
          >
            <Link href="/courses" className="flex items-center gap-3">
              Explore All Courses
              <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}