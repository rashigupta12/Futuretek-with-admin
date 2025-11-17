// src/app/(protected)/dashboard/admin/courses/edit/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  DateInput,
  DynamicStringList,
  DynamicWhyLearn,
  Field,
  StatusSelect,
  TextInput,
} from "@/components/courses/course-form";
import RichTextEditor from "@/components/courses/RichTextEditor";

type Course = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  instructor: string | null;
  duration: string | null;
  totalSessions: number | null;
  priceINR: number;
  priceUSD: number;
  status: string;
  thumbnailUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  registrationDeadline: string | null;
  whyLearnIntro: string | null;
  whatYouLearn: string | null;
  disclaimer: string | null;
  maxStudents: number | null;
  currentEnrollments: number;
  commissionPercourse: number | null; // ← NEW
  features: string[];
  whyLearn: { title: string; description: string }[];
  courseContent: string[];
  topics: string[];
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Core fields ─────────────────────────────────────────────────────
  const [courseId, setCourseId] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
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
  const [maxStudents, setMaxStudents] = useState("");
  const [currentEnrollments, setCurrentEnrollments] = useState("0");
  const [commissionPercourse, setCommissionPercourse] = useState(""); // ← NEW

  // ── Arrays ───────────────────────────────────────────────────────
  const [features, setFeatures] = useState<string[]>([""]);
  const [whyLearn, setWhyLearn] = useState<
    { title: string; description: string }[]
  >([{ title: "", description: "" }]);
  const [courseContent, setCourseContent] = useState<string[]>([""]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([""]);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${slug}`);

      if (!res.ok) {
        throw new Error("Course not found");
      }

      const data: Course = await res.json();

      // Populate all fields
      setCourseId(data.id);
      setCourseSlug(data.slug);
      setTitle(data.title);
      setTagline(data.tagline || "");
      setDescription(data.description);
      setInstructor(data.instructor || "To be announced");
      setDuration(data.duration || "");
      setTotalSessions(data.totalSessions ? String(data.totalSessions) : "");
      setPriceINR(String(data.priceINR));
      setPriceUSD(String(data.priceUSD));
      setStatus(data.status);
      setThumbnailUrl(data.thumbnailUrl || "");

      // Format dates to YYYY-MM-DD
      setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
      setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
      setRegistrationDeadline(
        data.registrationDeadline ? data.registrationDeadline.split("T")[0] : ""
      );

      setWhyLearnIntro(data.whyLearnIntro || "");
      setWhatYouLearn(data.whatYouLearn || "");
      setDisclaimer(data.disclaimer || "");
      setMaxStudents(data.maxStudents ? String(data.maxStudents) : "");
      setCurrentEnrollments(String(data.currentEnrollments));
      setCommissionPercourse(
        data.commissionPercourse !== null ? String(data.commissionPercourse) : ""
      ); // ← NEW

      // Arrays
      setFeatures(data.features?.length > 0 ? data.features : [""]);
      setWhyLearn(
        data.whyLearn?.length > 0
          ? data.whyLearn
          : [{ title: "", description: "" }]
      );
      setCourseContent(
        data.courseContent?.length > 0 ? data.courseContent : [""]
      );
      setRelatedTopics(data.topics?.length > 0 ? data.topics : [""]);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      Swal.fire({
        icon: "error",
        title: "Not Found",
        text: "Course not found",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      slug: courseSlug,
      title,
      tagline: tagline || null,
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
      maxStudents: maxStudents ? Number(maxStudents) : null,
      currentEnrollments: Number(currentEnrollments),
      commissionPercourse: commissionPercourse ? Number(commissionPercourse) : null, // ← NEW

      features: features.filter((f) => f.trim()),
      whyLearn: whyLearn.filter((w) => w.title.trim() && w.description.trim()),
      content: courseContent.filter((c) => c.trim()),
      topics: relatedTopics.filter((t) => t.trim()),
    };

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Course updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/dashboard/admin/courses");
      } else {
        const err = await res.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.error || "Failed to update course",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "An unexpected error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-muted-foreground">Loading course...</div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <Link
        href="/dashboard/admin/courses"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *">
              <TextInput
                value={title}
                onChange={setTitle}
                placeholder="KP Astrology"
                required
              />
            </Field>

            <Field label="Slug *">
              <TextInput
                value={courseSlug}
                onChange={setCourseSlug}
                placeholder="kp-astrology"
                required
              />
            </Field>

            <Field label="Tagline">
              <TextInput
                value={tagline}
                onChange={setTagline}
                placeholder="Learn KP in its original form..."
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

            <Field label="Commission per Course (%)">
              <TextInput
                type="number"
                value={commissionPercourse}
                onChange={setCommissionPercourse}
                placeholder="15.5"
              />
            </Field>

            <Field label="Thumbnail URL">
              <TextInput
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                placeholder="https://..."
              />
            </Field>

            <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
            <DateInput label="End Date" value={endDate} onChange={setEndDate} />
            <DateInput
              label="Registration Deadline"
              value={registrationDeadline}
              onChange={setRegistrationDeadline}
            />

            <div className="md:col-span-2">
              <StatusSelect value={status} onChange={setStatus} />
            </div>
          </CardContent>
        </Card>

        {/* ── Long Texts with Rich Text Editor ── */}
        <Card>
          <CardHeader>
            <CardTitle>Content & SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Capacity</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/admin/courses">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}