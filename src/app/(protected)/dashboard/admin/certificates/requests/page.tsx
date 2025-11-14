// app/dashboard/admin/certificates/requests/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Clock, CheckCircle, XCircle, Search, Filter, User, Mail, BookOpen, Download } from "lucide-react";
import CertificateTemplate from "@/components/certificate-template";
import { generateCertificatePDF } from "@/hooks/generate-certificate-pdf";
import { useCurrentRole, useCurrentUser } from "@/hooks/auth";

interface CertificateRequest {
  id: string;
  userId: string;
  enrollmentId: string;
  user: {
    name: string;
    email: string;
  };
  enrollment: {
    course: {
      title: string;
      instructor: string;
      duration: string;
      startDate: string;
      endDate: string;
    };
    completedAt: string | null;
    certificateIssued: boolean;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  processedAt: string | null;
  processedBy: string | null;
  notes: string | null;
}

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [generatingCertificate, setGeneratingCertificate] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [currentCertificateData, setCurrentCertificateData] = useState<any>(null);
  const user = useCurrentUser()

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/certificates/requests");
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndGenerate = async (requestId: string, enrollmentId: string, requestData: CertificateRequest) => {
    try {
      setGeneratingCertificate(requestId);
      
      // Generate certificate data
      const certificateData = {
        studentName: requestData.user.name,
        courseName: requestData.enrollment.course.title,
        startDate: requestData.enrollment.course.startDate,
        endDate: requestData.enrollment.course.endDate,
        instructor: requestData.enrollment.course.instructor,
        certificateId: `FT-${requestId.slice(0, 8).toUpperCase()}`,
        issueDate: new Date().toISOString()
      };

      setCurrentCertificateData(certificateData);

      // Wait for certificate to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!certificateRef.current) {
        throw new Error('Certificate element not found');
      }

      // Generate PDF
      const pdfUrl = await generateCertificatePDF(certificateRef.current, `${certificateData.studentName}_certificate`);
      
      // Send approval request with certificate URL
      const response = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          adminId:user?.id,
          certificateUrl: pdfUrl,
          certificateData
        }),
      });

      if (response.ok) {
        fetchRequests(); // Refresh the list
        alert('Certificate generated successfully!');
      } else {
        throw new Error('Failed to approve certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setGeneratingCertificate(null);
      setCurrentCertificateData(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/certificates/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
          processedBy: user?.id,
          notes: "Certificate request rejected by admin",
        }),
      });

      if (response.ok) {
        fetchRequests();
        alert('Certificate request rejected');
      } else {
        const errorData = await response.json();
        console.error("Failed to reject certificate:", errorData.error);
      }
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      alert('Failed to reject certificate request');
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "APPROVED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-3 h-3 mr-1" />;
      case "APPROVED":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "REJECTED":
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
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
      {/* Hidden certificate template for PDF generation */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <div ref={certificateRef}>
          {currentCertificateData && (
            <CertificateTemplate data={currentCertificateData} />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and process certificate requests from students
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredRequests.length} request(s) found
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-4">
          <div className="flex-1">
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
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus !== "all" 
                ? "Try changing your filters or search term."
                : "No certificate requests at the moment."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.enrollment.course.title}
                      </h3>
                      <span className={getStatusBadge(request.status)}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Student:</span>
                        <span className="ml-1">{request.user.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-1">{request.user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Instructor:</span>
                        <span className="ml-1">{request.enrollment.course.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Duration:</span>
                        <span className="ml-1">{request.enrollment.course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Requested:</span>{" "}
                        {new Date(request.requestedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {request.enrollment.completedAt && (
                        <div>
                          <span className="font-medium">Completed:</span>{" "}
                          {new Date(request.enrollment.completedAt).toLocaleDateString()}
                        </div>
                      )}
                      {request.processedAt && (
                        <div>
                          <span className="font-medium">Processed:</span>{" "}
                          {new Date(request.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {request.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.status === "PENDING" && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApproveAndGenerate(request.id, request.enrollmentId, request)}
                        disabled={generatingCertificate === request.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                      >
                        {generatingCertificate === request.id ? (
                          <>
                            <Award className="w-4 h-4 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve & Generate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}