import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah J.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'The KP Astrology course has transformed my understanding of chart analysis. Highly recommended!',
    rating: 5
  },
  {
    name: 'Michael R.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'Thanks to the Financial Astrology course, I\'ve gained valuable insights into market trends. It\'s been a game-changer for my investments.',
    rating: 5
  },
  {
    name: 'Priya M.',
    avatar: '/placeholder.svg?height=40&width=40',
    testimonial: 'The Vastu Shastra course provided practical knowledge that I\'ve successfully applied to improve the energy in my home and office.',
    rating: 5
  },
]

export function Testimonials() {
  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What Our Students Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-100 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how our courses have transformed learning experiences
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-gray-300 overflow-hidden relative "
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-5">
                <Quote className="h-16 w-16 text-gray-400" />
              </div>
              
              {/* Top Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-100 group-hover:from-gray-300 group-hover:to-gray-200 transition-colors"></div>
              
              <CardContent className="pt-8 pb-6">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed text-[15px] italic relative">
                  <Quote className="h-5 w-5 text-gray-300 absolute -left-2 -top-1" />
                  {testimonial.testimonial}
                </p>
              </CardContent>
              
              <CardFooter className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Avatar className="h-12 w-12 border-2 border-gray-200">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">Course Student</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Students Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}