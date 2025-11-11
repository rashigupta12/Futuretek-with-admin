/*eslint-disable @typescript-eslint/no-explicit-any */
// app/(protected)/dashboard/agent/assign-coupons/page.tsx
"use client";

import { AlertCircle, Book, Calendar, Clock, Search, Tag, Users } from "lucide-react";
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
  // const { data: session } = useSession();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Assign Coupons to Students</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleAssignCoupon} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Book className="w-4 h-4 inline mr-2" />
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedStudent(""); // Reset student when course changes
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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

          {/* Student Selection - Only show if course is selected */}
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Select Coupon
              </label>
              <select
                value={selectedCoupon}
                onChange={(e) => setSelectedCoupon(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  This student is already enrolled in the selected course.
                </span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Coupons cannot be assigned to students who are already enrolled.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || selectedStudentData?.isEnrolled}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Assigning Coupon..." : "Assign Coupon to Student"}
          </button>
        </form>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Assignments</h2>
        
        {recentAssignments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Tag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No recent assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{assignment.studentName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 text-sm">{assignment.studentEmail}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Book className="w-4 h-4 text-purple-600" />
                        <span>Course: {assignment.courseTitle}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span>
                          Coupon: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{assignment.couponCode}</code>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          Discount: {assignment.discountType === "PERCENTAGE" ? `${assignment.discountValue}%` : `₹${assignment.discountValue}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{formatDate(assignment.assignedAt)}</span>
                        <Clock className="w-4 h-4 text-blue-600 ml-2" />
                        <span>{formatTime(assignment.assignedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Assigned by: {assignment.assignedByName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}