// src/app/(protected)/dashboard/user/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UserDashboardHome() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative">
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-yellow-500 rounded-full"></div>
        <div className="pl-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Welcome back!</h1>
          <p className="text-slate-600 mt-1">Continue your learning journey</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              Enrolled Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">5</div>
            <p className="text-xs text-blue-600 mt-1">+2 this month</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              Hours Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">42</div>
            <p className="text-xs text-blue-600 mt-1">↑ 18% from last week</p>
          </CardContent>
        </Card>

        <Card className="border border-yellow-100 bg-gradient-to-br from-white to-yellow-50/30 shadow-sm hover:shadow-lg hover:border-yellow-200 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Trophy className="h-4 w-4 text-yellow-600" />
              </div>
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">3</div>
            <p className="text-xs text-slate-600 mt-1">2 in progress</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">12 days</div>
            <p className="text-xs text-yellow-600 mt-1">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-900">Continue Learning</h2>
          <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Link href="/dashboard/user/courses" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Vedic Astrology Basics", progress: 75, sessions: 12 },
            { title: "Nakshatra Deep Dive", progress: 45, sessions: 8 },
            { title: "Dasha Systems Mastery", progress: 90, sessions: 15 },
          ].map((course) => (
            <Card key={course.title} className="border border-blue-100 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden group">
              {/* Golden Top Border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-base font-semibold line-clamp-1 text-blue-900">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-blue-900">{course.progress}%</span>
                  </div> */}
                  <div className="w-full bg-blue-50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{course.sessions} sessions</p>
                </div>
                <Button asChild className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm" size="sm">
                  <Link href="#">Continue</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-yellow-50/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Ready for your next course?</h3>
              <p className="text-slate-600 text-sm mt-1">Explore our comprehensive astrological programs</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/courses" className="flex items-center gap-2">
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}