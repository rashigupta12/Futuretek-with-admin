// src/app/(protected)/dashboard/admin/courses/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  TextInput,
  DateInput,
  StatusSelect,
  DynamicStringList,
  DynamicWhyLearn,
  Field,
} from "@/components/courses/course-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [maxStudents, setMaxStudents] = useState("");
  const [currentEnrollments, setCurrentEnrollments] = useState("0");

  // ── Arrays ───────────────────────────────────────────────────────
  const [features, setFeatures] = useState<string[]>([""]);
  const [whyLearn, setWhyLearn] = useState<
    { title: string; description: string }[]
  >([{ title: "", description: "" }]);
  const [courseContent, setCourseContent] = useState<string[]>([""]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      slug,
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

      features: features.filter((f) => f.trim()),
      whyLearn: whyLearn.filter((w) => w.title.trim() && w.description.trim()),
      courseContent: courseContent.filter((c) => c.trim()),
      relatedTopics: relatedTopics.filter((t) => t.trim()),
    };

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Course created successfully!");
        router.push("/dashboard/admin/courses");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create course");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6  mx-auto">
      <Link
        href="/dashboard/admin/courses"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <h1 className="text-2xl font-bold mb-2">Add New Course</h1>
    

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
                value={slug}
                onChange={setSlug}
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

        {/* ── Long Texts ── */}
        <Card>
          <CardHeader>
            <CardTitle>Content & SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Description *">
              <Textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field label="Why Learn Intro">
              <Textarea
                rows={3}
                value={whyLearnIntro}
                onChange={(e) => setWhyLearnIntro(e.target.value)}
              />
            </Field>

            <Field label="What You Learn">
              <Textarea
                rows={6}
                value={whatYouLearn}
                onChange={(e) => setWhatYouLearn(e.target.value)}
              />
            </Field>

            <Field label="Disclaimer">
              <Textarea
                rows={3}
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
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
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Course"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/admin/courses">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}