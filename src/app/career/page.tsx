import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function CareerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Career Opportunities at Futuretek</h1>
      
      <p className="text-lg mb-8 text-center">Join our team of experts and contribute to the world of astrological sciences. We offer a dynamic work environment and opportunities for growth and learning.</p>

      <h2 className="text-3xl font-bold mb-4">Current Openings</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {openings.map((job, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{job.description}</p>
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <ul className="list-disc pl-5">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button>Apply Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Work With Us?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            <li>Opportunity to work with leading experts in the field of astrology and Vastu</li>
            <li>Continuous learning and professional development</li>
            <li>Flexible work environment</li>
            <li>Competitive salary and benefits</li>
            <li>Chance to make a positive impact on people's lives through ancient wisdom</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

