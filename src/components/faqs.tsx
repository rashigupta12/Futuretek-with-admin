import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What is KP Astrology?',
    answer: 'KP Astrology, or Krishnamurti Paddhati, is a modern system of astrology that focuses on precise predictions using sub-divisions of houses and planetary positions.',
  },
  {
    question: 'How long are the courses?',
    answer: 'Course durations vary depending on the subject and depth. Typically, our courses range from 4 to 12 weeks, with both part-time and full-time options available.',
  },
  {
    question: 'Are the courses suitable for beginners?',
    answer: 'Yes, we offer courses for all levels, from beginners to advanced practitioners. Each course is designed to provide a solid foundation and progressively build on that knowledge.',
  },
  {
    question: 'Can I apply these learnings professionally?',
    answer: 'Many of our students go on to become professional astrologers, vastu consultants, or use these skills to enhance their existing careers in counseling, real estate, or finance.',
  },
]

export function FAQs() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

