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

import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── Core fields ─────────────────────────────────────────────────────
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("To be announced");
  const [duration, setDuration] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [priceINR, setPriceINR] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [whyLearnIntro, setWhyLearnIntro] = useState("");
  const [whatYouLearn, setWhatYouLearn] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  // const [maxStudents, setMaxStudents] = useState("");
  // const [currentEnrollments, setCurrentEnrollments] = useState("0");

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

  // // Validate sessions
  // const validateSessions = () => {
  //   if (sessions.length === 0) return true;
    
  //   for (const session of sessions) {
  //     if (!session.title.trim()) {
  //       alert(`Session ${session.sessionNumber} must have a title`);
  //       return false;
  //     }
  //     if (!session.sessionDate) {
  //       alert(`Session ${session.sessionNumber} must have a date`);
  //       return false;
  //     }
  //     if (!session.sessionTime) {
  //       alert(`Session ${session.sessionNumber} must have a time`);
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  // Call validateDates when dates change
  useEffect(() => {
    validateDates();
  }, [registrationDeadline, startDate, endDate]);

  // Auto-generate sessions when totalSessions changes
  useEffect(() => {
    if (totalSessions && sessions.length === 0) {
      const total = parseInt(totalSessions);
      if (total > 0) {
        const newSessions: Session[] = [];
        for (let i = 1; i <= total; i++) {
          newSessions.push({
            id: `temp-${Date.now()}-${i}`,
            sessionNumber: i,
            title: `Session ${i}`,
            description: "",
            sessionDate: "",
            sessionTime: "",
            duration: 60,
            meetingLink: "",
            meetingPasscode: "",
            recordingUrl: "",
            isCompleted: false,
          });
        }
        setSessions(newSessions);
      }
    }
  }, [totalSessions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
// Replace: alert("Please fix the date validation errors before submitting");
Swal.fire({
  icon: 'warning',
  title: 'Validation Error',
  text: 'Please fix the date validation errors before submitting',
});      return;
    }
    setLoading(true);

    const payload = {
      slug,
      title,
      tagline: tagline,
      description,
      instructor: instructor || null,
      duration: duration || null,
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
      // maxStudents: maxStudents ? Number(maxStudents) : null,
      // currentEnrollments: Number(currentEnrollments),

      features: features.filter((f) => f.trim()),
      whyLearn: whyLearn.filter((w) => w.title.trim() && w.description.trim()),
      courseContent: courseContent.filter((c) => c.trim()),
      relatedTopics: relatedTopics.filter((t) => t.trim()),
      sessions: sessions.map(session => ({
        ...session,
        duration: Number(session.duration),
        // Remove temporary ID for new sessions
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
        // Replace: alert("Course created successfully!");
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
// Replace: alert(err.error || "Failed to create course");
Swal.fire({
  icon: 'error',
  title: 'Error',
  text: err.error || 'Failed to create course',
});

// Replace: alert("Unexpected error");
Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'An unexpected error occurred',
});      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  }, [title]);

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

              <Field label="Slug *">
                <TextInput
                  value={slug}
                  onChange={setSlug}
                  placeholder="kp-astrology"
                  required
                />
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

              <Field label="Instructor">
                <TextInput
                  value={instructor}
                  onChange={setInstructor}
                  placeholder="To be announced"
                />
              </Field>

              <Field label="Duration">
                <TextInput
                  value={duration}
                  onChange={setDuration}
                  placeholder="25 live sessions"
                />
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
                <TextInput
                  type="number"
                  value={priceUSD}
                  onChange={setPriceUSD}
                  placeholder="250"
                  required
                />
              </Field>

              <Field label="Thumbnail URL">
                <TextInput
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  placeholder="https://..."
                />
              </Field>

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

          {/* ── Capacity ── */}
          {/* <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b">
              <CardTitle className="text-xl text-gray-900">Capacity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Max Students">
                <TextInput
                  type="number"
                  value={maxStudents}
                  onChange={setMaxStudents}
                  placeholder="50"
                />
              </Field>

              <Field label="Current Enrollments">
                <TextInput
                  type="number"
                  value={currentEnrollments}
                  onChange={setCurrentEnrollments}
                  placeholder="0"
                />
              </Field>
            </CardContent>
          </Card> */}

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