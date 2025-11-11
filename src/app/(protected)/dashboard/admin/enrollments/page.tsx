/*eslint-disable  @typescript-eslint/no-explicit-any*/
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, MoreVertical, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TableContainer } from "@/components/admin/TableContainer";

// type RawEnrollment = {
//   id: string;
//   userId: string;
//   courseId: string;
//   status: string;
//   enrolledAt: string;
//   certificateIssued: boolean;
// };

type User = {
  id: string;
  name: string;
  email: string;
};

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Payment = {
  id: string;
  enrollmentId: string;
  invoiceNumber: string;
  finalAmount: string;
  status: string;
  createdAt: string;
};

type Enrollment = {
  id: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string; slug: string };
  status: string;
  enrolledAt: string;
  payment: { amount: number; invoiceId: string };
};

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoading(true);

      const [enrollRes, courseRes, userRes, paymentRes] = await Promise.all([
        fetch("/api/admin/enrollments"),
        fetch("/api/courses"),
        fetch("/api/admin/users"),
        fetch("/api/admin/payments"),
      ]);

      const [enrollData, courseData, userData, paymentData] = await Promise.all([
        enrollRes.json(),
        courseRes.json(),
        userRes.json(),
        paymentRes.json(),
      ]);

      // ✅ Unwrap nested arrays
      const enrollments = enrollData?.enrollments || [];
      const users = userData?.users || [];
      const payments = paymentData?.payments || [];
      const courses = courseData || [];

      // ✅ Map users
      const userMap = new Map<string, User>();
      users.forEach((u: any) => {
        userMap.set(u.id, { id: u.id, name: u.name, email: u.email });
      });

      // ✅ Map courses
      const courseList: Course[] = courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
      }));

      // ✅ Map payments by enrollmentId
      const paymentMap = new Map<string, Payment>();
      payments.forEach((p: any) => {
        if (p.enrollmentId) {
          paymentMap.set(p.enrollmentId, {
            id: p.id,
            enrollmentId: p.enrollmentId,
            invoiceNumber: p.invoiceNumber,
            finalAmount: (p.finalAmount || 0),
            status: p.status,
            createdAt: p.createdAt,
          });
        }
      });

      // ✅ Build enrollments
      const builtEnrollments: Enrollment[] = enrollments.map((e: any) => {
        const user = userMap.get(e.userId) || {
          id: e.userId,
          name: "Unknown User",
          email: "",
        };

        const course = courseList.find((c) => c.id === e.courseId) || {
          id: e.courseId,
          title: `Course #${e.courseId.slice(0, 8)}`,
          slug: e.courseId,
        };

        const payment = paymentMap.get(e.id);
        const paymentInfo = payment
          ? { amount: payment.finalAmount, invoiceId: payment.invoiceNumber }
          : { amount: 0, invoiceId: "N/A" };

        return {
          id: e.id,
          user,
          course,
          status: e.status,
          enrolledAt: e.enrolledAt,
          payment: paymentInfo,
        };
      });

      // ✅ Update states
      setEnrollments(builtEnrollments);
      setCourses([{ id: "ALL", title: "All Courses", slug: "" }, ...courseList]);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, []);


  const filtered = enrollments.filter((e) => {
    const matchesSearch =
      e.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "ALL" || e.course.id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="p-4 w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Enrollments</h2>
          <p className="text-muted-foreground mt-1">Track student progress and payments.</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TableContainer>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading enrollments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No enrollments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/admin/users/${e.user.id}`} className="font-medium hover:underline">
                        {e.user.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">{e.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{e.course.title}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{e.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ₹{e.payment.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(e.enrolledAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-0">
                          <Link href={`/dashboard/admin/payments/invoice/${e.payment.invoiceId}`}>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Payment
                            </button>
                          </Link>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableContainer>
    </div>
  );
}