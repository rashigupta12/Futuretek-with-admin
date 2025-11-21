/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  DateInput,
  DynamicStringList,
  DynamicWhyLearn,
  Field,
  StatusSelect,
  TextInput,
} from "@/components/courses/course-form";
import RichTextEditor from "@/components/courses/RichTextEditor";
import SessionManager, { Session } from "@/components/SessionManager";
import { JyotishiSearch } from "@/components/JyotishiSearch";

import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";

const USD_TO_INR_RATE = 83.5; // Default conversion rate

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── Core fields ─────────────────────────────────────────────────────
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("To be announced");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [priceINR, setPriceINR] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [isUSDManual, setIsUSDManual] = useState(false);
  const [status, setStatus] = useState("DRAFT");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [whyLearnIntro, setWhyLearnIntro] = useState("");
  const [whatYouLearn, setWhatYouLearn] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [commissionPercourse, setCommissionPercourse] = useState("");
  
  // Jyotishi assignment
  const [assignedJyotishiId, setAssignedJyotishiId] = useState<string | null>(null);
  const [assignedJyotishiName, setAssignedJyotishiName] = useState<string | null>(null);

  // ── Arrays ───────────────────────────────────────────────────────
  const [features, setFeatures] = useState<string[]>([""]);
  const [whyLearn, setWhyLearn] = useState<
    { title: string; description: string }[]
  >([{ title: "", description: "" }]);
  const [courseContent, setCourseContent] = useState<string[]>([""]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([""]);

  // ── Sessions ─────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([]);

  const [dateErrors, setDateErrors] = useState({
    registrationDeadline: "",
    startDate: "",
    endDate: "",
  });

  const validateDates = () => {
    const errors = {
      registrationDeadline: "",
      startDate: "",
      endDate: "",
    };

    if (registrationDeadline && startDate) {
      if (new Date(registrationDeadline) >= new Date(startDate)) {
        errors.registrationDeadline =
          "Registration deadline must be before start date";
      }
    }

    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        errors.startDate = "Start date must be before end date";
      }
    }

    setDateErrors(errors);
    return Object.values(errors).every((error) => !error);
  };

  useEffect(() => {
    validateDates();
  }, [registrationDeadline, startDate, endDate]);

  // Auto-generate slug (greyed out, non-editable)
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    } else {
      setSlug("");
    }
  }, [title]);

  // Auto-calculate USD from INR
  useEffect(() => {
    if (!isUSDManual && priceINR) {
      const inrValue = parseFloat(priceINR);
      if (!isNaN(inrValue)) {
        const calculatedUSD = (inrValue / USD_TO_INR_RATE).toFixed(2);
        setPriceUSD(calculatedUSD);
      }
    }
  }, [priceINR, isUSDManual]);

  // Format duration display
  const formatDuration = () => {
    const minutes = parseInt(durationMinutes);
    if (isNaN(minutes)) return "";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDates()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fix the date validation errors before submitting',
      });
      return;
    }
    setLoading(true);

    // Calculate total duration string
    const durationString = formatDuration() || `${totalSessions} live sessions`;

    const payload = {
      slug,
      title,
      tagline,
      description,
      instructor: instructor || null,
      duration: durationString,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      totalSessions: totalSessions ? Number(totalSessions) : null,
      priceINR: priceINR ? Number(priceINR) : null,
      priceUSD: priceUSD ? Number(priceUSD) : null,
      status,
      thumbnailUrl: thumbnailUrl || null,
      startDate: startDate || null,
      endDate: endDate || null,
      registrationDeadline: registrationDeadline || null,
      whyLearnIntro: whyLearnIntro || null,
      whatYouLearn: whatYouLearn || null,
      disclaimer: disclaimer || null,
      commissionPercourse: commissionPercourse ? Number(commissionPercourse) : null,
      assignedJyotishiId: assignedJyotishiId || null,

      features: features.filter((f) => f.trim()),
      whyLearn: whyLearn.filter((w) => w.title.trim() && w.description.trim()),
      courseContent: courseContent.filter((c) => c.trim()),
      relatedTopics: relatedTopics.filter((t) => t.trim()),
      sessions: sessions.map(session => ({
        ...session,
        duration: Number(session.duration),
        id: session.id.startsWith('temp-') ? undefined : session.id,
      })),
    };

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Course Created!',
          text: 'Course has been created successfully',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          router.push("/dashboard/admin/courses");
        });
      } else {
        const err = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error || 'Failed to create course',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Course
              </h1>
              <p className="text-gray-600">
                Create a new course with all necessary details and content.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Basic Info ── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Title *">
                <TextInput
                  value={title}
                  onChange={(value) => {
                    const capitalized =
                      value.charAt(0).toUpperCase() + value.slice(1);
                    setTitle(capitalized);
                  }}
                  placeholder="KP Astrology"
                  required
                />
              </Field>

              <Field label="Slug (Auto-generated)">
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed font-mono text-sm"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Field>

              <Field label="Tagline *">
                <TextInput
                  value={tagline}
                  onChange={(value) => {
                    const capitalized =
                      value.charAt(0).toUpperCase() + value.slice(1);
                    setTagline(capitalized);
                  }}
                  placeholder="Learn KP in its original form..."
                  required
                />
              </Field>

              <Field label="Instructor *">
                <JyotishiSearch
                  value={assignedJyotishiId}
                  onChange={(id, name) => {
                    setAssignedJyotishiId(id);
                    setAssignedJyotishiName(name);
                    // Auto-set instructor name when Jyotishi is selected
                    setInstructor(name || "To be announced");
                  }}
                  selectedName={assignedJyotishiName}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Search and assign a Astrologer as the course instructor
                </p>
              </Field>

              <Field label="Duration (Minutes)">
                <div className="space-y-2">
                  <TextInput
                    type="number"
                    value={durationMinutes}
                    onChange={setDurationMinutes}
                    placeholder="1500"
                  />
                  {durationMinutes && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
                      📅 {formatDuration()}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Total Sessions">
                <TextInput
                  type="number"
                  value={totalSessions}
                  onChange={setTotalSessions}
                  placeholder="25"
                />
              </Field>

              <Field label="Price (INR) *">
                <TextInput
                  type="number"
                  value={priceINR}
                  onChange={setPriceINR}
                  placeholder="20000"
                  required
                />
              </Field>

              <Field label="Price (USD) *">
                <div className="space-y-2">
                  <div className="relative">
                    <TextInput
                      type="number"
                      value={priceUSD}
                      onChange={(value) => {
                        setPriceUSD(value);
                        setIsUSDManual(true);
                      }}
                      placeholder="250"
                      required
                    />
                    {!isUSDManual && priceUSD && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <span className="text-xs text-green-600 font-medium">
                          Auto-calculated
                        </span>
                      </div>
                    )}
                  </div>
                  {isUSDManual && (
                    <button
                      type="button"
                      onClick={() => setIsUSDManual(false)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Reset to auto-calculate
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Commission per Course (%)">
                <TextInput
                  type="number"
                  value={commissionPercourse}
                  onChange={setCommissionPercourse}
                  placeholder="15.5"
                />
              </Field>

              <div className="md:col-span-2">
                <ImageUpload
                  label="Thumbnail Image"
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  isThumbnail={true}
                />
              </div>

              <DateInput
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                error={dateErrors.startDate}
              />
              <DateInput
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
              <DateInput
                label="Registration Deadline"
                value={registrationDeadline}
                onChange={setRegistrationDeadline}
                error={dateErrors.registrationDeadline}
              />

              <div className="md:col-span-2">
                <StatusSelect value={status} onChange={setStatus} />
              </div>
            </CardContent>
          </Card>

          {/* ── Sessions Management ── */}
          <SessionManager
            sessions={sessions}
            setSessions={setSessions}
            totalSessions={parseInt(totalSessions) || 0}
          />

          {/* ── Long Texts ── */}
          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b">
              <CardTitle className="text-xl text-gray-900">
                Content & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Field label="Description *">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter course description..."
                  minHeight="300px"
                />
              </Field>

              <Field label="Why Learn Intro">
                <RichTextEditor
                  value={whyLearnIntro}
                  onChange={setWhyLearnIntro}
                  placeholder="Enter why learn introduction..."
                  minHeight="200px"
                />
              </Field>

              <Field label="What You Learn">
                <RichTextEditor
                  value={whatYouLearn}
                  onChange={setWhatYouLearn}
                  placeholder="Enter what students will learn..."
                  minHeight="300px"
                />
              </Field>

              <Field label="Disclaimer">
                <RichTextEditor
                  value={disclaimer}
                  onChange={setDisclaimer}
                  placeholder="Enter disclaimer..."
                  minHeight="200px"
                />
              </Field>
            </CardContent>
          </Card>

          {/* ── Dynamic Lists ── */}
          <DynamicStringList
            title="Features"
            items={features}
            setItems={setFeatures}
            placeholder="25 live sessions on Zoom"
          />

          <DynamicWhyLearn items={whyLearn} setItems={setWhyLearn} />

          <DynamicStringList
            title="Course Content"
            items={courseContent}
            setItems={setCourseContent}
            placeholder="The Zodiac and Its Divisions"
          />

          <DynamicStringList
            title="Related Topics"
            items={relatedTopics}
            setItems={setRelatedTopics}
            placeholder="Astrology"
          />

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? "Creating…" : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link href="/dashboard/admin/courses">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}