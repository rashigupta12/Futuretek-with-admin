import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

const blogPosts = [
  {
    title: 'Understanding the Basics of KP Astrology',
    description: 'Dive into the fundamental principles of Krishnamurti Paddhati (KP) astrology and how it differs from traditional methods.',
    link: '/blog/kp-astrology-basics',
    date: 'Nov 8, 2025',
  },
  {
    title: 'Financial Astrology: Predicting Market Trends',
    description: 'Explore how astrological cycles can be used to anticipate shifts in financial markets and make informed investment decisions.',
    link: '/blog/financial-astrology-market-trends',
    date: 'Nov 5, 2025',
  },
  {
    title: 'Vastu Tips for a Harmonious Home Office',
    description: 'Learn how to apply Vastu principles to create a productive and balanced work environment in your home.',
    link: '/blog/vastu-home-office-tips',
    date: 'Nov 2, 2025',
  },
]

export function Blogs() {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-5 py-2.5 text-xs font-semibold tracking-widest uppercase mb-5 shadow-sm">
            <Calendar className="h-4 w-4" />
            <span>Latest Insights</span>
          </div>
          <h2 className="text-4xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Latest from Our Blog
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stay updated with expert insights on astrology, Vastu, and personal growth.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <BlogCard key={index} post={post} index={index} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-14">
          <Button
            asChild
            size="lg"
            className="group bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl font-semibold px-8"
          >
            <Link href="/blog" className="flex items-center gap-2">
              View All Posts
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// Extracted Blog Card Component
function BlogCard({ post }: { post: typeof blogPosts[0]; index: number }) {
  return (
    <Card className="group h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Optional: Add image placeholder later */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{post.date}</span>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
          {post.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow">
        <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
          {post.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          asChild
          variant="ghost"
          className="w-full group/button justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition-all duration-200 rounded-xl"
        >
          <Link href={post.link}>
            <span>Read More</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover/button:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}