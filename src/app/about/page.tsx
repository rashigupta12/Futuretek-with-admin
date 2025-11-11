import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Futuretek
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bridging ancient wisdom with modern science to empower your life's journey
          </p>
        </div>

        {/* Vision Card */}
        <Card className="mb-12 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🌌</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              At Futuretek Institute of Astrological Sciences, we envision a world where 
              ancient wisdom and modern science converge to provide profound insights and 
              practical solutions for navigating life&apos;s challenges. Our mission is to 
              empower individuals with the knowledge of KP Astrology, Financial Astrology, 
              Vastu Shastra, and Astro-Vastu, enabling them to make informed decisions 
              and create harmonious environments in both personal and professional spheres.
            </p>
          </CardContent>
        </Card>

        {/* Directors Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Our Directors
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Card - Profile */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 group">
              <CardHeader className="text-center pb-4">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl">👨‍💼</span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Sunil Dixit</CardTitle>
                <p className="text-blue-600 font-medium">Founder & Director</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Sunil Dixit is a distinguished leader in the fields of Vedic Astrology 
                    and Vastu Shastra. As the Founder and Director of the &apos;Futuretek 
                    Institute of Astrological Sciences&apos;, he has dedicated himself to 
                    the advancement and education of these ancient sciences.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    He is a Managing Partner at &apos;SS Techno Vastu&apos;, where his 
                    expertise in software engineering and Vastu Science significantly 
                    influences strategic decision-making in the production of 
                    &apos;Vastuteq software&apos;.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right Card - Professional Experience */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💼</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      Professional Experience
                    </CardTitle>
                    <p className="text-blue-600 font-medium">15+ Years of Excellence</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      With over <strong>15 years of experience</strong> in practicing and teaching 
                      Astrology and Vastu, Sunil Dixit has established himself as a 
                      trusted advisor and mentor in these domains.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      His extensive career includes a notable tenure as a <strong>Project Manager</strong> 
                      with a top 10 IT company in Europe, where he successfully managed 
                      projects both in India and overseas.
                    </p>
                  </div>
                  
                  <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-blue-500">🌍</span>
                      International Expertise
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Managed cross-cultural teams and delivered projects across 
                      multiple continents, bringing global perspective to astrological sciences.
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-blue-500">🎓</span>
                      Teaching & Mentorship
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Dedicated to educating the next generation of astrologers and 
                      Vastu consultants through comprehensive training programs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legal Information */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <CardTitle className="text-3xl font-bold text-white">Legal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Company Name</h4>
                  <p className="text-white/90">
                    Futuretek Institute of Astrological Sciences Pvt. Ltd.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Registration Number</h4>
                  <p className="text-white/90">U74999DL2023PTC123456</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Registered Address</h4>
                  <p className="text-white/90">
                    123 Cosmic Lane, Stellar Heights<br />
                    New Delhi - 110001, India
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-1">Contact</h4>
                  <p className="text-white/90">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}