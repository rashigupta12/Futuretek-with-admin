'use client';

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Users, Clock, IndianRupee, DollarSign, Loader2, AlertCircle, BookOpen } from 'lucide-react'

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
      REGISTRATION_OPEN: { label: 'Enrolling', color: 'bg-green-100 text-green-800 border-green-200' },
      UPCOMING: { label: 'Coming Soon', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      ONGOING: { label: 'In Progress', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      ARCHIVED: { label: 'Archived', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading courses</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={fetchCourses} className="bg-gray-900 hover:bg-gray-800">
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
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600 mb-2">Check back soon for new courses!</p>
            <p className="text-sm text-gray-500">We're preparing something amazing for you.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Featured Courses</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-100 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master ancient sciences with our comprehensive curriculum
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="flex flex-col group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-gray-300 overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {getStatusBadge(course.status)}
              </div>
              
              {/* Top Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-100 group-hover:from-gray-300 group-hover:to-gray-200 transition-colors"></div>
              
              <CardHeader className="pb-4 relative">
                <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
                  {course.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <CardDescription className="line-clamp-3 text-gray-600 leading-relaxed text-[15px] mb-6">
                  {getPlainText(course.description)}
                </CardDescription>
                
                {/* Course Stats */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <IndianRupee className="h-4 w-4" />
                      <span>INR</span>
                    </div>
                    <span className="font-semibold text-gray-900">₹{course.priceINR?.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Enrolled</span>
                    </div>
                    <span className="text-gray-700">{course.currentEnrollments || 0}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-3 pt-4 border-t border-gray-100">
                <Button asChild size="sm" className="flex-1 bg-gray-900 hover:bg-gray-800">
                  <Link href={`/courses/${course.slug}`}>
                    View Details
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  disabled={course.status !== 'REGISTRATION_OPEN'}
                >
                  <Link href={`/courses/${course.slug}#enroll`}>
                    {course.status === 'REGISTRATION_OPEN' ? 'Enroll Now' : 'Coming Soon'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 px-8 py-3 h-auto font-medium"
          >
            <Link href="/courses" className="flex items-center gap-2">
              Explore All Courses
              <BookOpen className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}