import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">About Us</h3>
            <p className="text-sm">
              Futuretek Institute of Astrological Sciences offers expert-led
              courses in KP Astrology, Financial Astrology, Vastu Shastra, and
              Astro-Vastu.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-gray-900">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a
                  href="mailto:info@futuretek.com"
                  className="hover:text-gray-900"
                >
                  info@futuretek.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <a href="tel:+1234567890" className="hover:text-gray-900">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>123 Astro Lane, Cosmic City, AC 12345</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-sm mb-4">
              Stay updated with our latest courses and astrological insights.
            </p>
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-grow"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; 2023 Futuretek Institute. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-gray-900">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-gray-900">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-gray-900">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
