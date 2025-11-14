// components/certificate-template.tsx
"use client";

import { useEffect, useRef } from 'react';

interface CertificateData {
  studentName: string;
  courseName: string;
  startDate: string;
  endDate: string;
  instructor?: string;
  certificateId?: string;
  issueDate?: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  onLoad?: () => void;
}

export default function CertificateTemplate({ data, onLoad }: CertificateTemplateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      ref={certificateRef}
      className="w-full bg-white border-8 border-yellow-400 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 25%, #fef3c7 50%, #fefce8 100%)',
        minHeight: '700px'
      }}
    >
      {/* Certificate Border */}
      <div className="border-4 border-yellow-600 m-4 h-full min-h-[650px] relative">
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-yellow-700"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-yellow-700"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-yellow-700"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-yellow-700"></div>

        {/* Header Section */}
        <div className="text-center pt-8 pb-6">
          <div className="mb-2">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-yellow-800 mb-2 tracking-wider">
            FUTURETEK INSTITUTE
          </h1>
          <h2 className="text-2xl font-semibold text-yellow-700 mb-1">
            Of Astrological Sciences
          </h2>
          <div className="w-48 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-3 mb-4"></div>
          <p className="text-lg text-yellow-600 italic">
            Mastering Ancient Wisdom Through Modern Education
          </p>
        </div>

        {/* Main Content */}
        <div className="text-center px-12 py-8">
          <p className="text-xl text-gray-600 mb-6 uppercase tracking-wide">
            This Certificate is Proudly Presented to
          </p>
          
          <div className="mb-8">
            <h3 className="text-4xl font-bold text-yellow-800 mb-4 py-3 px-6 border-b-2 border-t-2 border-yellow-300 inline-block">
              {data.studentName}
            </h3>
          </div>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            for successfully completing the course of study in
          </p>

          <div className="mb-8">
            <h4 className="text-3xl font-semibold text-yellow-700 mb-2 italic">
              "{data.courseName}"
            </h4>
          </div>

          <div className="text-lg text-gray-600 mb-8 leading-relaxed">
            <p>Course Duration: {formatDate(data.startDate)} to {formatDate(data.endDate)}</p>
            {data.instructor && (
              <p className="mt-2">Instructor: {data.instructor}</p>
            )}
          </div>

          <div className="mt-12 mb-8">
            <p className="text-lg text-gray-600 mb-2">
              Awarded on {data.issueDate ? formatDate(data.issueDate) : formatDate(new Date().toISOString())}
            </p>
            {data.certificateId && (
              <p className="text-sm text-gray-500">
                Certificate ID: {data.certificateId}
              </p>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex justify-between items-center px-12">
            {/* Director Signature */}
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Director</p>
              <p className="text-sm font-semibold text-yellow-700">Futuretek Institute</p>
            </div>

            {/* Institute Seal */}
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-yellow-700 text-center leading-tight">
                  FUTURETEK INSTITUTE
                </span>
              </div>
              <p className="text-xs text-gray-500">Official Seal</p>
            </div>

            {/* Registrar Signature */}
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Registrar</p>
              <p className="text-sm font-semibold text-yellow-700">Futuretek Institute</p>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>
    </div>
  );
}