import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users, GraduationCap, Heart } from 'lucide-react'

const openings = [
  {
    title: 'KP Astrology Instructor',
    description: 'We are seeking an experienced KP Astrology practitioner to join our team as an instructor. The ideal candidate should have at least 5 years of experience in KP Astrology and a passion for teaching.',
    requirements: ['5+ years of experience in KP Astrology', 'Excellent communication skills', 'Teaching experience preferred'],
  },
  {
    title: 'Vastu Consultant',
    description: 'We are looking for a Vastu Shastra expert to provide consultations and contribute to our Vastu courses. The ideal candidate should have a deep understanding of Vastu principles and their modern applications.',
    requirements: ['Degree in Architecture or related field', 'Certification in Vastu Shastra', 'Minimum 3 years of consulting experience'],
  },
  {
    title: 'Content Writer (Astrology)',
    description: 'We need a talented content writer with knowledge of astrology to create engaging and informative content for our blog, courses, and social media platforms.',
    requirements: ['Strong writing skills in English', 'Knowledge of astrology (preferably KP Astrology)', 'Experience in content creation for digital platforms'],
  },
]

const benefits = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Expert Community',
    description: 'Opportunity to work with leading experts in the field of astrology and Vastu'
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Continuous Learning',
    description: 'Continuous learning and professional development'
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Positive Impact',
    description: 'Chance to make a positive impact on people\'s lives through ancient wisdom'
  },
]

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Join Our Mission to Spread Ancient Wisdom
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent mb-6">
            Career Opportunities at Futuretek
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join our team of experts and contribute to the world of astrological sciences. 
            We offer a dynamic work environment and opportunities for growth and learning.
          </p>
        </div>

        {/* Current Openings */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Current Openings</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {openings.map((job, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-400 bg-white"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-blue-700 transition-colors">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-muted-foreground mb-4 leading-relaxed">{job.description}</p>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-600">
                      Requirements:
                    </h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all">
                    Apply Now
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-blue-900 to-purple-900 text-white border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl md:text-4xl font-bold">
                Why Work With Us?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all duration-300">
                      <div className="text-blue-200">
                        {benefit.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 text-white">{benefit.title}</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Additional Benefits */}
        <Card className="mb-16 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Work Environment</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Flexible work environment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Dynamic and supportive team culture
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Compensation & Growth</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Competitive salary and benefits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Opportunities for growth and learning
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}