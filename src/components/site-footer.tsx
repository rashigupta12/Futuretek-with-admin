import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Star,
  Globe,
  BookOpen,
  Users
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-xl">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Futuretek</h3>
                <p className="text-[10px] text-blue-200">Institute of Astrological Sciences</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Master ancient wisdom with modern teaching methodologies. Expert-led courses 
              in KP Astrology, Financial Astrology, Vastu Shastra, and Astro-Vastu.
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="p-0.5 bg-blue-500/20 rounded">
                  <Users className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-[11px] text-gray-200 font-medium">1000+ Students</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="p-0.5 bg-purple-500/20 rounded">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-[11px] text-gray-200 font-medium">20+ Courses</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/courses", label: "All Courses" },
                { href: "/about", label: "About Institute" },
                { href: "/instructors", label: "Our Instructors" },
                { href: "/testimonials", label: "Success Stories" },
                { href: "/blog", label: "Astro Blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group text-xs"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-blue-400" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg mt-0.5 border border-blue-500/20">
                  <Mail className="w-3 h-3 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-[10px] font-semibold mb-0.5">Email</div>
                  <a
                    href="mailto:info@futuretekastro.com"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-xs break-all"
                  >
                    info@futuretekastro.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="p-1.5 bg-green-500/10 rounded-lg mt-0.5 border border-green-500/20">
                  <Phone className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-[10px] font-semibold mb-0.5">Phone</div>
                  <a href="tel:+919876543210" className="text-gray-400 hover:text-green-400 transition-colors text-xs">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded-lg mt-0.5 border border-purple-500/20">
                  <MapPin className="w-3 h-3 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-[10px] font-semibold mb-0.5">Address</div>
                  <span className="text-gray-400 text-xs leading-relaxed">
                    123 Cosmic Lane, Stellar Heights
                    <br />
                    New Delhi - 110001, India
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">
              Stay Updated
            </h3>
            <p className="text-gray-400 text-xs mb-3 leading-relaxed">
              Get weekly astrological insights, course updates, and exclusive learning resources.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 h-9 text-xs"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white h-9 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
              >
                Subscribe
              </Button>
              <p className="text-[10px] text-gray-500">
                No spam ever. Unsubscribe anytime.
              </p>
            </form>
            
            {/* Social Links */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-white text-xs font-semibold mb-2">Connect With Us</h4>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, href: "#", bg: "bg-[#1877F2]", hover: "hover:bg-[#0C63D4]" },
                  { icon: Instagram, href: "#", bg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]", hover: "hover:opacity-90" },
                  { icon: Twitter, href: "#", bg: "bg-[#1DA1F2]", hover: "hover:bg-[#0C8BD9]" },
                  { icon: Youtube, href: "#", bg: "bg-[#FF0000]", hover: "hover:bg-[#CC0000]" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-2 ${social.bg} ${social.hover} rounded-lg text-white transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl`}
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-4">
          {/* Copyright - Centered */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>&copy; 2024 Futuretek Institute. All rights reserved.</span>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-gray-500" />
                <span className="text-gray-400">India</span>
              </div>
            </div>
          </div>
          
          {/* Links - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}