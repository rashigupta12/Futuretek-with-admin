// app/dashboard/admin/certificates/page.tsx
"use client";

import { Award, BookOpen, Calendar, Eye, Mail, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

interface Certificate {
  id: string;
  enrollmentId: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
    instructor: string;
  };
  certificateUrl: string;
  certificateIssuedAt: string;
  completedAt: string;
  finalGrade?: number;
}

export default function AllCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/admin/certificates");
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = 
      cert.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = (!dateRange.start || new Date(cert.certificateIssuedAt) >= new Date(dateRange.start)) &&
                       (!dateRange.end || new Date(cert.certificateIssuedAt) <= new Date(dateRange.end));
    
    return matchesSearch && matchesDate;
  });

  // const handleDownload = (certificateUrl: string, userName: string, courseName: string) => {
  //   const link = document.createElement('a');
  //   link.href = certificateUrl;
  //   link.download = `${userName}_${courseName.replace(/\s+/g, '_')}_certificate.pdf`;
  //   link.click();
  // };

  const handleView = (certificateUrl: string) => {
    window.open(certificateUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Certificates</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all issued certificates
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCertificates.length} certificate(s) issued
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by student name, email, or course..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateRange.start || dateRange.end
                ? "Try changing your filters or search term."
                : "No certificates have been issued yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCertificates.map((certificate) => (
              <div key={certificate.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {certificate.course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Issued to {certificate.user.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Student:</span>
                        <span className="ml-1">{certificate.user.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-1">{certificate.user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Instructor:</span>
                        <span className="ml-1">{certificate.course.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Issued:</span>
                        <span className="ml-1">
                          {new Date(certificate.certificateIssuedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Course Completed:</span>{" "}
                        {new Date(certificate.completedAt).toLocaleDateString()}
                      </div>
                      {certificate.finalGrade && (
                        <div>
                          <span className="font-medium">Final Grade:</span> {certificate.finalGrade}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleView(certificate.certificateUrl)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {/* <button
                      onClick={() => handleDownload(certificate.certificateUrl, certificate.user.name, certificate.course.title)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}