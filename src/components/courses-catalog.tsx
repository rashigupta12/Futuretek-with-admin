import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const courses = [
  {
    title: 'KP Astrology',
    description: 'Learn the science of precise chart analysis and accurate predictions.',
    link: '/courses/kp-astrology',
  },
  {
    title: 'Financial Astrology',
    description: 'Unlock the secrets of financial success using astrological movements.',
    link: '/courses/financial-astrology',
  },
  {
    title: 'Vastu Shastra',
    description: 'Explore the ancient art of designing harmonious and prosperous spaces.',
    link: '/courses/vastu-shastra',
  },
  {
    title: 'Astro-Vastu',
    description: 'Combine astrology and Vastu to create aligned and balanced environments.',
    link: '/courses/astro-vastu',
  },
]

export function CoursesCatalog() {
  return (
    <section className="py-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{course.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild>
                <Link href={course.link} className="mr-4">
                  Learn More
                </Link>
              </Button>
              <Link href={course.link} className="ml-4">
                Enroll Now
              </Link>
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

