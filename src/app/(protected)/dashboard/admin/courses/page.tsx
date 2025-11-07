// src/app/(protected)/dashboard/admin/courses/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Filter, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Course = {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number;
  forexPrice: number;
  enrollmentCount: number;
  createdAt: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "ALL"
          ? "/api/admin/courses"
          : `/api/admin/courses?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      const mapped: Course[] = (data.courses || []).map((c: any) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        status: c.status,
        price: Number(c.priceINR || 0),
        forexPrice: Number(c.priceUSD || 0),
        enrollmentCount: c.currentEnrollments ?? 0,
        createdAt: c.createdAt,
      }));

      setCourses(mapped);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        alert("Course deleted successfully");
      } else {
        alert("Failed to delete course");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting course");
    }
  };

  // Filter by search
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    "ALL",
    "DRAFT",
    "UPCOMING",
    "REGISTRATION_OPEN",
    "ONGOING",
    "COMPLETED",
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "REGISTRATION_OPEN":
        return "default";
      case "ONGOING":
        return "secondary";
      case "UPCOMING":
        return "outline";
      case "COMPLETED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Courses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your courses, create new ones, and track enrollment.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/courses/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No courses found. Create your first course!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{course.title}</div>
                      <div className="text-sm text-muted-foreground">{course.slug}</div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(course.status)}>
                        {course.status.replace(/_/g, " ")}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        ₹{course.price.toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${course.forexPrice.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {course.enrollmentCount}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-0">
                          <div className="flex flex-col">
                            <Link href={`/dashboard/admin/courses/${course.slug}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/courses/edit/${course.slug}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 rounded-none"
                              onClick={() => handleDelete(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}