import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const blogPosts = [
  {
    title: 'Understanding the Basics of KP Astrology',
    description: 'Dive into the fundamental principles of Krishnamurti Paddhati (KP) astrology and how it differs from traditional methods.',
    link: '/blog/kp-astrology-basics',
  },
  {
    title: 'Financial Astrology: Predicting Market Trends',
    description: 'Explore how astrological cycles can be used to anticipate shifts in financial markets and make informed investment decisions.',
    link: '/blog/financial-astrology-market-trends',
  },
  {
    title: 'Vastu Tips for a Harmonious Home Office',
    description: 'Learn how to apply Vastu principles to create a productive and balanced work environment in your home.',
    link: '/blog/vastu-home-office-tips',
  },
]

export function Blogs() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Latest from Our Blog</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{post.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={post.link}>Read More</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button asChild variant="outline">
          <Link href="/blog">View All Posts</Link>
        </Button>
      </div>
    </section>
  )
}

