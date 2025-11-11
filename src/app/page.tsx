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
  Award,
  CheckCircle,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import HeroSection from "@/components/hero";

export default async function Page() {
  return (
    <>
      <div className="flex flex-col gap-20">
        <HeroSection />

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Why Choose Us Section */}
          <section className="py-2">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose FutureTek
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional education in ancient sciences with modern teaching
                methodologies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "Expert Instructors",
                  description:
                    "Learn from certified practitioners with decades of professional experience in their respective fields.",
                  color: "purple",
                  gradient: "from-purple-500 to-blue-500",
                },
                {
                  icon: BookOpen,
                  title: "Structured Curriculum",
                  description:
                    "Comprehensive course materials designed for progressive learning and practical application.",
                  color: "blue",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Target,
                  title: "All Skill Levels",
                  description:
                    "Courses tailored for beginners to advanced practitioners seeking professional development.",
                  color: "green",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: Globe,
                  title: "Holistic Methodology",
                  description:
                    "Integrated approach combining traditional wisdom with contemporary scientific understanding.",
                  color: "orange",
                  gradient: "from-orange-500 to-amber-500",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="group border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:border-gray-300 shadow-md relative overflow-hidden"
                >
                  {/* Top Border Gradient */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.gradient}`}
                  ></div>

                  <CardHeader className="pb-4 pt-6">
                    <div
                      className={`w-12 h-12 bg-${item.color}-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                    >
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Courses Catalog */}
          <CoursesCatalog />

          {/* Curriculum Focus Section */}
          <section className="py-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What You will Learn
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Specialized disciplines combining ancient wisdom with practical
                application
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Star,
                  title: "KP Astrology",
                  description:
                    "Master the Krishnamurti Paddhati system for precise chart analysis and predictive techniques used by professional astrologers.",
                  features: [
                    "Sub-lord theory",
                    "Ruling planets",
                    "Timing techniques",
                    "Horary astrology",
                  ],
                  gradient: "from-blue-500 to-purple-500",
                },
                {
                  icon: Target,
                  title: "Financial Astrology",
                  description:
                    "Learn to analyze market cycles and economic trends using planetary movements and technical indicators.",
                  features: [
                    "Market timing",
                    "Investment cycles",
                    "Planetary periods",
                    "Risk assessment",
                  ],
                  gradient: "from-green-500 to-blue-500",
                },
                {
                  icon: Shield,
                  title: "Vastu Shastra",
                  description:
                    "Professional training in spatial design principles for enhancing energy flow in residential and commercial spaces.",
                  features: [
                    "Space planning",
                    "Energy mapping",
                    "Remedial measures",
                    "Modern applications",
                  ],
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: Lightbulb,
                  title: "Astro-Vastu Integration",
                  description:
                    "Advanced methodology combining astrological charts with Vastu principles for personalized space optimization.",
                  features: [
                    "Chart analysis",
                    "Directional strength",
                    "Personalized solutions",
                    "Case studies",
                  ],
                  gradient: "from-orange-500 to-red-500",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 shadow-md relative overflow-hidden"
                >
                  {/* Top Border Gradient */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.gradient}`}
                  ></div>

                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <div className="space-y-2">
                      {item.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Learning Methodology */}
          <section className="py-16 bg-gray-50 rounded-2xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Learn with Us
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Structured approach for comprehensive understanding and skill
                development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Personalized Guidance",
                  description:
                    "One-on-one mentorship and small group sessions for individualized learning paths and progress tracking.",
                  gradient: "from-purple-500 to-blue-500",
                },
                {
                  icon: BookOpen,
                  title: "Comprehensive Resources",
                  description:
                    "Access to detailed study materials, case studies, and reference libraries for continuous learning.",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Award,
                  title: "Practical Application",
                  description:
                    "Real-world projects and case studies to develop professional consulting skills and client management.",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 bg-white text-center hover:shadow-xl transition-all duration-300 shadow-md relative overflow-hidden"
                >
                  {/* Top Border Gradient */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.gradient}`}
                  ></div>

                  <CardHeader className="pt-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
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
          <section className="py-16 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 rounded-2xl mb-10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 0),
                        radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 0)`,
                  backgroundSize: "50px 50px",
                  backgroundPosition: "0 0, 25px 25px",
                }}
              ></div>
            </div>

            {/* Golden Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>

            <div className="max-w-3xl mx-auto text-center px-6 relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Begin Your Professional Journey
              </h2>
              <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                Join FutureTek Institute to master ancient sciences with modern
                professional standards. Transform your knowledge into practical
                expertise.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <Link href="/courses" className="flex items-center gap-2">
                    Explore Courses
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-black hover:bg-white hover:bg-transparent hover:text-white transition-all duration-300 font-semibold"
                >
                  <Link href="/contact">Schedule Consultation</Link>
                </Button>
              </div>
              <p className="text-slate-300 text-sm mt-6">
                Professional certification available upon course completion
              </p>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
