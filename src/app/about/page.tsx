/*eslint-diable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        About Futuretek Institute
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            At Futuretek Institute of Astrological Sciences, we envision a world
            where ancient wisdom and modern science converge to provide profound
            insights and practical solutions for navigating life&apos;s challenges.
            Our mission is to empower individuals with the knowledge of KP
            Astrology, Financial Astrology, Vastu Shastra, and Astro-Vastu,
            enabling them to make informed decisions and create harmonious
            environments in both personal and professional spheres.
          </p>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold mb-4">Our Directors</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sunil Dixit</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p>
              Sunil Dixit is a distinguished leader in the fields of Vedic
              Astrology and Vastu Shastra. As the Founder and Director of the
              Futuretek Institute of Astrological Sciences', he has dedicated
              himself to the advancement and education of these ancient
              sciences. He is a Managing Partner at 'SS Techno Vastu', where his
              expertise in software engineering and Vastu Science significantly
              influences strategic decision-making in the production of
              'Vastuteq software'.
            </p>
            <h2 className="text-2xl font-bold">Professional Experience</h2>
            <p>
              With over 15 years of experience in practicing and teaching
              Astrology and Vastu, Sunil Dixit has established himself as a
              trusted advisor and mentor in these domains. His career includes a
              notable tenure as a Project Manager with a top 10 IT company in
              Europe, managed projects both in India and overseas.
            </p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Prof. Sarah Johnson</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Prof. Sarah Johnson is an expert in Financial Astrology with a
              background in economics. She has successfully combined
              astrological insights with financial analysis to provide unique
              perspectives on market trends.
            </p>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Company Name:</strong> Futuretek Institute of Astrological
            Sciences Pvt. Ltd.
          </p>
          <p>
            <strong>Registration Number:</strong> U74999DL2023PTC123456
          </p>
          <p>
            <strong>Registered Address:</strong> 123 Cosmic Lane, Stellar
            Heights, New Delhi - 110001, India
          </p>
          <p>
            <strong>Contact:</strong> +91 98765 43210
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

