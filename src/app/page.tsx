import { Hero } from "@/components/hero";
import { CoursesCatalog } from "@/components/courses-catalog";
import { FAQs } from "@/components/faqs";
import { Blogs } from "@/components/blogs";
import { Testimonials } from "@/components/testimonials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="flex flex-col gap-16">
      <Hero />
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 sm:gap-16 px-4 sm:px-6 lg:px-8">
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expert Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                Learn from experienced practitioners and professionals who offer
                clear, practical, and accurate teachings in every subject.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                Our courses are structured to help you understand the concepts
                thoroughly, blending theory with real-world applications.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tailored for Everyone</CardTitle>
              </CardHeader>
              <CardContent>
                Whether you're a beginner or looking to deepen your knowledge,
                we offer courses that cater to all levels of expertise.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Holistic Approach</CardTitle>
              </CardHeader>
              <CardContent>
                Gain mastery in multiple disciplines such as astrology and
                Vastu, empowering you to make balanced and informed decisions in
                all areas of life.
              </CardContent>
            </Card>
          </div>
        </section>

        <CoursesCatalog />

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">What You Will Learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KP Astrology</CardTitle>
              </CardHeader>
              <CardContent>
                How to interpret charts, predict life events, and time major
                decisions using the Krishnamurti Paddhati method.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Financial Astrology</CardTitle>
              </CardHeader>
              <CardContent>
                Understanding market cycles, investment timing, and wealth
                management using astrology.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vastu</CardTitle>
              </CardHeader>
              <CardContent>
                Learn to design spaces that enhance positive energy and
                well-being.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Astro-Vastu</CardTitle>
              </CardHeader>
              <CardContent>
                Combine astrology and Vastu principles to create personalised,
                harmonious living and working spaces.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Why Learn With Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalised Approach</CardTitle>
              </CardHeader>
              <CardContent>
                Tailored learning experiences designed to fit your personal
                growth and professional development.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Resources</CardTitle>
              </CardHeader>
              <CardContent>
                Access to detailed course materials, live sessions, one-on-one
                mentorship, and an exclusive community of learners.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Practical Application</CardTitle>
              </CardHeader>
              <CardContent>
                Learn to apply these ancient sciences effectively in modern
                contexts—whether it's for personal use or professional
                consultation.
              </CardContent>
            </Card>
          </div>
        </section>

        <FAQs />

        <Blogs />

        <Testimonials />

        <section className="text-center bg-muted py-16 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">
            Join Us on a Journey of Discovery
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Transform your life by mastering the ancient sciences of astrology
            and Vastu. Whether you're looking to understand your life's purpose
            or guide others, our courses provide the tools you need for success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/courses">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/courses">Learn More</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
