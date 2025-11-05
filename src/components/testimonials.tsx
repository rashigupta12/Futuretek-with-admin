import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Sarah J.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'The KP Astrology course has transformed my understanding of chart analysis. Highly recommended!',
  },
  {
    name: 'Michael R.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'Thanks to the Financial Astrology course, I\'ve gained valuable insights into market trends. It\'s been a game-changer for my investments.',
  },
  {
    name: 'Priya M.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'The Vastu Shastra course provided practical knowledge that I\'ve successfully applied to improve the energy in my home and office.',
  },
]

export function Testimonials() {
  return (
    <section className="py-12 bg-muted">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Students Say</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-background">
            <CardContent className="pt-6">
              <p className="text-muted-foreground italic">"{testimonial.testimonial}"</p>
            </CardContent>
            <CardFooter className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

