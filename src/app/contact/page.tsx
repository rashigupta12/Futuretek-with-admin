import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our astronomical services? We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Form Card */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                Send us a Message
              </CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input 
                      id="name" 
                      placeholder="Enter your full name" 
                      required 
                      className="h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input 
                      id="email" 
                      placeholder="your.email@example.com" 
                      type="email" 
                      required 
                      className="h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    placeholder="+91 98765 43210" 
                    type="tel" 
                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Your Message *
                  </Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your astronomical needs or questions..." 
                    required 
                    rows={5}
                    className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Send Message
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & Details */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/90">Address</h3>
                    <p className="text-white/80 text-sm">123 Cosmic Lane, Stellar Heights</p>
                    <p className="text-white/80 text-sm">New Delhi - 110001, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/90">Email</h3>
                    <p className="text-white/80 text-sm">info@futuretekastro.com</p>
                    <p className="text-white/80 text-sm">support@futuretekastro.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/90">Phone</h3>
                    <p className="text-white/80 text-sm">+91 98765 43210</p>
                    <p className="text-white/80 text-sm">+91 98765 43211</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white/90">Office Hours</h3>
                    <p className="text-white/80 text-sm">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-white/80 text-sm">Saturday: 10:00 AM - 2:00 PM</p>
                    <p className="text-white/80 text-sm">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Response Card */}
            <Card className="shadow-lg border-0 bg-amber-50 border-l-4 border-amber-400">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Quick Response</h3>
                    <p className="text-amber-800 text-sm">
                      We typically respond to all inquiries within 2-4 business hours during our office hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground text-sm">
                24/7 email support for all your astronomical queries
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-muted-foreground text-sm">
                Direct phone support during business hours
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-muted-foreground text-sm">
                Fast and reliable responses to all inquiries
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}