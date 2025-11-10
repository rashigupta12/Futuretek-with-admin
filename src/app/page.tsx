import { Hero } from "@/components/hero";
import { CoursesCatalog } from "@/components/courses-catalog";
import { FAQs } from "@/components/faqs";
import { Blogs } from "@/components/blogs";
import { Testimonials } from "@/components/testimonials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Star, 
  Users, 
  BookOpen, 
  Target, 
  Lightbulb, 
  Shield,
  Globe,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default async function Page() {
  return (
    <div className="flex flex-col gap-24">
      <Hero />
      
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Why Choose Us Section */}
        <section className="text-center mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50/30 pointer-events-none" />
          <div className="relative mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6 border border-purple-200/50">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Why we're different</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Choose FutureTek
            </h2>
           
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                icon: Users,
                title: "Expert Instructors",
                description: "Learn from experienced practitioners and professionals who offer clear, practical, and accurate teachings in every subject.",
                gradient: "from-purple-100 to-pink-100",
                iconColor: "text-purple-600"
              },
              {
                icon: BookOpen,
                title: "Comprehensive Curriculum",
                description: "Our courses are structured to help you understand concepts thoroughly, blending theory with real-world applications.",
                gradient: "from-blue-100 to-cyan-100",
                iconColor: "text-blue-600"
              },
              {
                icon: Target,
                title: "Tailored for Everyone",
                description: "Whether you're a beginner or looking to deepen your knowledge, we offer courses that cater to all levels of expertise.",
                gradient: "from-green-100 to-emerald-100",
                iconColor: "text-green-600"
              },
              {
                icon: Globe,
                title: "Holistic Approach",
                description: "Gain mastery in multiple disciplines, empowering you to make balanced and informed decisions in all areas of life.",
                gradient: "from-orange-100 to-red-100",
                iconColor: "text-orange-600"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border border-gray-100/50 shadow-lg hover:shadow-purple-500/10 backdrop-blur-sm bg-white/70 hover:bg-white/90 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="pb-4 relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Courses Catalog */}
        <CoursesCatalog />

        {/* What You Will Learn Section */}
        <section className="text-center mb-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/20 pointer-events-none" />
          <div className="relative mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-full px-4 py-2 mb-6 border border-blue-200/50">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Learning outcomes</span>
            </div>
            <h2 className="text-5xl font-bold text-purple-900  mb-6">
              What You Will Learn
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master ancient sciences with modern applications and practical implementations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {[
              {
                icon: Star,
                title: "KP Astrology",
                description: "How to interpret charts, predict life events, and time major decisions using the Krishnamurti Paddhati method with precision and accuracy.",
                color: "blue",
                gradient: "from-blue-50 to-cyan-50",
                border: "hover:border-blue-200"
              },
              {
                icon: Target,
                title: "Financial Astrology",
                description: "Understanding market cycles, investment timing, and wealth management using astrology to make informed financial decisions.",
                color: "green",
                gradient: "from-green-50 to-emerald-50",
                border: "hover:border-green-200"
              },
              {
                icon: Shield,
                title: "Vastu Shastra",
                description: "Learn to design and transform spaces that enhance positive energy, well-being, and prosperity in both residential and commercial settings.",
                color: "purple",
                gradient: "from-purple-50 to-violet-50",
                border: "hover:border-purple-200"
              },
              {
                icon: Lightbulb,
                title: "Astro-Vastu",
                description: "Combine astrology and Vastu principles to create personalized, harmonious living and working spaces that align with cosmic energies.",
                color: "orange",
                gradient: "from-orange-50 to-amber-50",
                border: "hover:border-orange-200"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 border border-gray-100/50 shadow-lg ${item.border} backdrop-blur-sm bg-gradient-to-br ${item.gradient} hover:-translate-y-2 relative overflow-hidden`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center gap-4 text-gray-800">
                    <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Learn With Us Section */}
        <section className="text-center mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-50/20 pointer-events-none" />
          <div className="relative mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-cyan-100 rounded-full px-4 py-2 mb-6 border border-emerald-200/50">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Our methodology</span>
            </div>
            <h2 className="text-5xl font-bold text-purple-900 mb-6">
              Why Learn With Us?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience learning that transforms your understanding and application through innovative approaches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                icon: Users,
                title: "Personalised Approach",
                description: "Tailored learning experiences designed to fit your personal growth and professional development with individual attention.",
                color: "purple"
              },
              {
                icon: BookOpen,
                title: "Comprehensive Resources",
                description: "Access to detailed course materials, live sessions, one-on-one mentorship, and an exclusive community of dedicated learners.",
                color: "blue"
              },
              {
                icon: Target,
                title: "Practical Application",
                description: "Learn to apply these ancient sciences effectively in modern contexts—whether for personal use or professional consultation services.",
                color: "green"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-500 border border-gray-100/50 shadow-lg backdrop-blur-sm bg-white/80 hover:bg-white hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-100" />
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center justify-center gap-3 text-gray-800">
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                    </div>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <FAQs />
        <Blogs />
        <Testimonials />

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-24 rounded-3xl border border-gray-100/50 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 mb-6 border border-purple-200/50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Begin your journey</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Join Us on a Journey of <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Discovery</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your life by mastering the ancient sciences of astrology and Vastu. 
              Whether you're looking to understand your life's purpose or guide others, 
              our courses provide the tools you need for success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5">
                <Link href="/courses" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm backdrop-blur-sm">
                <Link href="/courses" className="flex items-center gap-2">
                  Learn More
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-gray-600 hover:bg-white/50 hover:text-gray-700 backdrop-blur-sm">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}