'use client';

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

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
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Error state
  if (error) {
    return (
      <section className="py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold">Error loading courses</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
          <Button onClick={fetchCourses} className="mt-4">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <p className="text-muted-foreground">No courses available at the moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back soon for new courses!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="line-clamp-3">
                {getPlainText(course.description)} {/* ← Use helper function */}
              </CardDescription>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Price:</span>
                  <span>₹{course.priceINR?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Enrollments:</span>
                  <span>{course.currentEnrollments || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 pt-4">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/courses/${course.slug}`}>
                  Learn More  
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/courses/${course.slug}#enroll`}>
                  Enroll Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/courses">Explore All Courses</Link>
        </Button>
      </div>
    </section>
  );
}