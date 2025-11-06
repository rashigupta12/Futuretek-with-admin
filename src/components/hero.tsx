import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative min-h-[600px] w-full overflow-hidden rounded-xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Astrological background"
          className="h-full w-full object-cover object-center"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[600px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 h-32 w-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Main Content */}
        <div className="space-y-6 max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fade-in">
            Futuretek Institute Of Astrological Sciences
          </h1>

          <p className="text-white/90 max-w-3xl text-lg sm:text-xl mx-auto">
            Your Pathway to Wisdom in KP Astrology, Financial Astrology, Mega
            Vastu, and Astro-Vastu
          </p>

          <p className="text-white/70 max-w-2xl text-sm sm:text-base mx-auto">
            At Futuretek we offer expert-led courses designed to equip you with
            profound knowledge and practical skills in KP Astrology, Financial
            Astrology, Vastu Shastra, and Astro-Vastu. Whether you &apos;re seeking to
            gain personal insights or expand your professional expertise, our
            programs empower you to harness ancient wisdom to navigate modern
            life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              asChild
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 transition-colors w-full sm:w-auto"
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
              className="border-white/20 text-black w-full sm:w-auto"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
