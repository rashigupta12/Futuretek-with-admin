/*eslint-disable @typescript-eslint/no-explicit-any */
// app/(protected)/dashboard/agent/assign-coupons/page.tsx
"use client";

import { AlertCircle, Book, Calendar, Clock, Search, Tag, Users, X, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  isEnrolled?: boolean;
}

interface Course {
  id: string;
  title: string;
  priceINR: string;
}

interface Coupon {
  id: string;
  code: string;
  discountValue: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  validUntil: string;
}

interface EnrollmentCheck {
  studentId: string;
  isEnrolled: boolean;
}

interface RecentAssignment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  couponCode: string;
  discountValue: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  assignedAt: string;
  assignedByName: string;
}

export default function AssignCouponsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentChecks, setEnrollmentChecks] = useState<EnrollmentCheck[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  console.log(enrollmentChecks)

  useEffect(() => {
    fetchData();
    fetchRecentAssignments();
  }, []);

  // Check enrollments when course selection changes
  useEffect(() => {
    if (selectedCourse && students.length > 0) {
      checkStudentEnrollments();
    }
  }, [selectedCourse, students]);

  const fetchData = async () => {
    try {
      // Fetch students (users)
      const studentsRes = await fetch("/api/jyotishi/students");
      const studentsData = await studentsRes.json();
      
      // Transform the student data to match our interface
      const transformedStudents: Student[] = studentsData.students?.map((student: any) => ({
        id: student.studentId,
        name: student.studentName || "Unknown Student",
        email: student.studentEmail || "No email"
      })) || [];
      
      setStudents(transformedStudents);

      // Fetch courses
      const coursesRes = await fetch("/api/courses");
      const coursesData = await coursesRes.json();
      
      // Transform course data - handle both array and object responses
      let transformedCourses: Course[] = [];
      if (Array.isArray(coursesData)) {
        transformedCourses = coursesData.map((course: any) => ({
          id: course.id,
          title: course.title,
          priceINR: course.priceINR
        }));
      } else if (coursesData.courses) {
        transformedCourses = coursesData.courses.map((course: any) => ({
          id: course.id,
          title: course.title,
          priceINR: course.priceINR
        }));
      }
      
      setCourses(transformedCourses);

      // Fetch Jyotishi's coupons
      const couponsRes = await fetch("/api/jyotishi/coupons");
      const couponsData = await couponsRes.json();
      
      // Transform coupon data
      const transformedCoupons: Coupon[] = couponsData.coupons?.map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType,
        validUntil: coupon.validUntil
      })) || [];
      
      setCoupons(transformedCoupons);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchRecentAssignments = async () => {
    try {
      const response = await fetch("/api/jyotishi/recent-assignments");
      const data = await response.json();
      
      if (data.assignments) {
        setRecentAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching recent assignments:", error);
    }
  };

  const checkStudentEnrollments = async () => {
    try {
      const response = await fetch(`/api/jyotishi/check-enrollments?courseId=${selectedCourse}`);
      const data = await response.json();
      
      if (data.enrollments) {
        setEnrollmentChecks(data.enrollments);
        
        // Update students with enrollment status
        setStudents(prevStudents => 
          prevStudents.map(student => ({
            ...student,
            isEnrolled: data.enrollments.some((e: EnrollmentCheck) => 
              e.studentId === student.id && e.isEnrolled
            )
          }))
        );
      }
    } catch (error) {
      console.error("Error checking enrollments:", error);
    }
  };

  const handleAssignCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedCourse || !selectedCoupon) {
      alert("Please select all fields");
      return;
    }

    // Check if student is already enrolled in this course
    const selectedStudentData = students.find(s => s.id === selectedStudent);
    if (selectedStudentData?.isEnrolled) {
      alert("This student is already enrolled in the selected course. Cannot assign coupon.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jyotishi/assign-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          courseId: selectedCourse,
          couponId: selectedCoupon,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Coupon assigned successfully!");
        // Reset form
        setSelectedStudent("");
        setSelectedCourse("");
        setSelectedCoupon("");
        setSearchTerm("");
        setEnrollmentChecks([]);
        setShowSidebar(false);
        
        // Refresh recent assignments
        await fetchRecentAssignments();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error assigning coupon:", error);
      alert("Failed to assign coupon");
    } finally {
      setLoading(false);
    }
  };

  // Safe filtering with null checks and enrollment status
  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Get selected student data for display
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-2 w-full mx-auto">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Assign Coupons to Students</h1>
          <p className="text-gray-600 mt-1">Manage coupon assignments for your students</p>
        </div>
        <button
          onClick={() => setShowSidebar(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Coupon to Student
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assignments - Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
            </div>
            
            {recentAssignments.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No recent assignments</p>
                <p className="text-sm text-gray-500 mt-1">Assign your first coupon to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{assignment.studentName}</span>
                            <span className="text-gray-500 text-sm block">{assignment.studentEmail}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{assignment.courseTitle}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>
                              <code className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-mono border border-amber-200">
                                {assignment.couponCode}
                              </code>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              assignment.discountType === "PERCENTAGE" ? "text-amber-600" : "text-blue-600"
                            }`}>
                              {assignment.discountType === "PERCENTAGE" ? `${assignment.discountValue}%` : `₹${assignment.discountValue}`} off
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{formatDate(assignment.assignedAt)}</span>
                            <Clock className="w-4 h-4 text-gray-500 ml-2" />
                            <span className="text-gray-600">{formatTime(assignment.assignedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Assigned by: <span className="font-medium text-gray-700">{assignment.assignedByName}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="font-semibold text-gray-900">{students.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Coupons</span>
                <span className="font-semibold text-amber-600">{coupons.filter(c => new Date(c.validUntil) > new Date()).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Assignments</span>
                <span className="font-semibold text-blue-600">{recentAssignments.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Assign coupons to students who haven&apos;t enrolled in courses yet.
            </p>
            <button
              onClick={() => setShowSidebar(true)}
              className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Assign Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Assign Coupon to Student</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-white hover:bg-blue-800 p-1 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleAssignCoupon} className="space-y-6">
                  {/* Course Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Book className="w-4 h-4 inline mr-2 text-blue-600" />
                      Select Course
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => {
                        setSelectedCourse(e.target.value);
                        setSelectedStudent(""); // Reset student when course changes
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Choose a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} (₹{course.priceINR})
                        </option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-sm text-gray-500">No courses found</p>
                    )}
                  </div>

                  {/* Student Selection */}
                  {selectedCourse && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <Users className="w-4 h-4 inline mr-2 text-blue-600" />
                        Select Student
                        <span className="text-xs text-gray-500 ml-2">
                          (Already enrolled students are disabled)
                        </span>
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Choose a student...</option>
                          {filteredStudents.map((student) => (
                            <option 
                              key={student.id} 
                              value={student.id}
                              disabled={student.isEnrolled}
                              className={student.isEnrolled ? "text-gray-400 bg-gray-100" : ""}
                            >
                              {student.name} ({student.email})
                              {student.isEnrolled && " - Already Enrolled"}
                            </option>
                          ))}
                        </select>
                        {filteredStudents.length === 0 && (
                          <p className="text-sm text-gray-500">No students found</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coupon Selection */}
                  {selectedCourse && selectedStudent && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 inline mr-2 text-amber-600" />
                        Select Coupon
                      </label>
                      <select
                        value={selectedCoupon}
                        onChange={(e) => setSelectedCoupon(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Choose a coupon...</option>
                        {coupons
                          .filter(coupon => {
                            try {
                              return new Date(coupon.validUntil) > new Date();
                            } catch {
                              return false;
                            }
                          })
                          .map((coupon) => (
                            <option key={coupon.id} value={coupon.id}>
                              {coupon.code} - {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off
                            </option>
                          ))}
                      </select>
                      {coupons.length === 0 && (
                        <p className="text-sm text-gray-500">No active coupons found</p>
                      )}
                    </div>
                  )}

                  {/* Warning message if student is enrolled */}
                  {selectedStudentData?.isEnrolled && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                        <span className="text-amber-800 font-medium">
                          This student is already enrolled
                        </span>
                      </div>
                      <p className="text-amber-700 text-sm mt-1">
                        Coupons cannot be assigned to students who are already enrolled in this course.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || selectedStudentData?.isEnrolled}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Assigning Coupon...
                      </span>
                    ) : (
                      "Assign Coupon to Student"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}