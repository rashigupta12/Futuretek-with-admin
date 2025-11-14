/*eslint-disable  @typescript-eslint/no-explicit-any*/
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Swal from 'sweetalert2';
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Plus,
  Save,
  Trash2,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description: string;
  instructor?: string | null;
  duration?: string | null;
  totalSessions?: number | null;
  priceINR: string | number;
  priceUSD: string | number;
  status: string;
  thumbnailUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  registrationDeadline?: string | null;
  whyLearnIntro?: string | null;
  whatYouLearn?: string | null;
  disclaimer?: string | null;
  maxStudents?: number | null;
  currentEnrollments: number;
  createdAt: string;
  updatedAt: string;
  features?: { feature: string }[] | string[];
  whyLearn?: { title: string; description: string }[];
  content?: { content: string }[];
  topics?: { topic: string }[];
};

export default function ViewCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editData, setEditData] = useState<Course | null>(null);

  useEffect(() => {
    if (params.id) fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      const safeStatus = data.status ?? "DRAFT";
      const normalizedFeatures = Array.isArray(data.features)
        ? data.features.map((f: string | { feature: string }) =>
            typeof f === "string" ? { feature: f } : f
          )
        : [];

      const courseData = {
        ...data,
        status: safeStatus,
        priceINR: data.priceINR ?? 0,
        priceUSD: data.priceUSD ?? 0,
        features: normalizedFeatures,
        whyLearn: Array.isArray(data.whyLearn) ? data.whyLearn : [],
        content: Array.isArray(data.content) ? data.content : [],
        topics: Array.isArray(data.topics) ? data.topics : [],
      };

      setCourse(courseData);
      setEditData(courseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...course! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...course! });
  };

  const handleSave = async () => {
    if (!editData) return;
    
    setSaving(true);
    try {
      const payload = {
        slug: editData.slug,
        title: editData.title,
        tagline: editData.tagline || null,
        description: editData.description,
        instructor: editData.instructor || null,
        duration: editData.duration || null,
        totalSessions: editData.totalSessions ? Number(editData.totalSessions) : null,
        priceINR: editData.priceINR ? Number(editData.priceINR) : null,
        priceUSD: editData.priceUSD ? Number(editData.priceUSD) : null,
        status: editData.status,
        thumbnailUrl: editData.thumbnailUrl || null,
        startDate: editData.startDate || null,
        endDate: editData.endDate || null,
        registrationDeadline: editData.registrationDeadline || null,
        whyLearnIntro: editData.whyLearnIntro || null,
        whatYouLearn: editData.whatYouLearn || null,
        disclaimer: editData.disclaimer || null,
        maxStudents: editData.maxStudents ? Number(editData.maxStudents) : null,
        currentEnrollments: Number(editData.currentEnrollments),
        features: (editData.features || []).map(f => typeof f === 'string' ? f : f.feature).filter(f => f.trim()),
        whyLearn: (editData.whyLearn || []).filter(w => w.title.trim() && w.description.trim()),
        content: (editData.content || []).map(c => typeof c === 'string' ? c : c.content).filter(c => c.trim()),
        topics: (editData.topics || []).map(t => typeof t === 'string' ? t : t.topic).filter(t => t.trim()),
      };

      const res = await fetch(`/api/admin/courses/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Course updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      setIsEditing(false);
      fetchCourse();
    } else {
      const err = await res.json();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.error || 'Failed to update course',
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error updating course',
    });
  } finally {
    setSaving(false);
  }
};

 const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/admin/courses/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Course deleted successfully',
        timer: 2000,
        showConfirmButton: false
      });
      router.push("/dashboard/admin/courses");
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Delete failed',
      });
    }
  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error deleting course',
    });
  }
};

  const updateEditField = (field: string, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const addArrayItem = (field: 'features' | 'whyLearn' | 'content' | 'topics') => {
    if (!editData) return;
    const newItem = field === 'whyLearn' 
      ? { title: '', description: '' }
      : field === 'features'
      ? { feature: '' }
      : field === 'content'
      ? { content: '' }
      : { topic: '' };
    const currentArray = editData[field] || [];
    setEditData({ ...editData, [field]: [...currentArray, newItem] });
  };

  const removeArrayItem = (field: 'features' | 'whyLearn' | 'content' | 'topics', index: number) => {
    if (!editData) return;
    const currentArray = editData[field] || [];
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    setEditData({ ...editData, [field]: newArray });
  };

  const updateArrayItem = (field: 'features' | 'whyLearn' | 'content' | 'topics', index: number, value: any) => {
    if (!editData) return;
    const currentArray = editData[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setEditData({ ...editData, [field]: newArray });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!course || !editData) return (
    <div className="container mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h2>
      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href="/dashboard/admin/courses">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Link>
      </Button>
    </div>
  );

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN") : "Not set";
  const formatDateForInput = (d: string | null) => d ? d.split('T')[0] : '';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-500",
      REGISTRATION_OPEN: "bg-green-500",
      ONGOING: "bg-blue-500",
      UPCOMING: "bg-yellow-500",
      COMPLETED: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const displayData = isEditing ? editData : course;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="relative py-8 mb-8 bg-gradient-to-r from-blue-50 to-amber-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/admin/courses"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Link>
                <Badge variant="outline" className="text-xs bg-white">
                  ADMIN VIEW
                </Badge>
              </div>


            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-700">Title</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => updateEditField('title', e.target.value)}
                    className="text-2xl font-bold border-blue-300 focus:border-blue-500 h-16"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-700">Tagline</Label>
                  <Input
                    value={editData.tagline || ''}
                    onChange={(e) => updateEditField('tagline', e.target.value)}
                    className="border-blue-300 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {displayData.title}
                </h1>
                {displayData.tagline && (
                  <p className="text-lg text-gray-600 mb-6">{displayData.tagline}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <Label className="text-sm text-gray-700">Topics</Label>
                  {(editData.topics || []).map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={typeof t === 'string' ? t : t.topic}
                        onChange={(e) => updateArrayItem('topics', i, { topic: e.target.value })}
                        placeholder="Topic"
                        className="border-blue-300 focus:border-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('topics', i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('topics')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Topic
                  </Button>
                </div>
              ) : (
                displayData.topics?.map((t) => (
                  <Badge
                    key={typeof t === 'string' ? t : t.topic}
                    className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                  >
                    {typeof t === 'string' ? t : t.topic}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Description</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => updateEditField('description', e.target.value)}
                      rows={6}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <p className="mb-6 leading-relaxed whitespace-pre-wrap text-gray-700">
                    {displayData.description || "No description provided."}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Instructor
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editData.instructor || ''}
                        onChange={(e) => updateEditField('instructor', e.target.value)}
                        className="border-blue-300 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700">
                        {displayData.instructor || "To be announced"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Duration
                    </Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editData.duration || ''}
                          onChange={(e) => updateEditField('duration', e.target.value)}
                          placeholder="25 live sessions"
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <Input
                          type="number"
                          value={editData.totalSessions || ''}
                          onChange={(e) => updateEditField('totalSessions', e.target.value)}
                          placeholder="Sessions count"
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        {displayData.duration || "Not specified"}
                        {displayData.totalSessions && ` • ${displayData.totalSessions} sessions`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                <CardTitle>Course Features</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Features</Label>
                    {(editData.features || []).map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={typeof f === 'string' ? f : f.feature}
                          onChange={(e) => updateArrayItem('features', i, { feature: e.target.value })}
                          placeholder="Feature"
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem('features', i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('features')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {displayData.features?.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="leading-snug text-gray-700">
                          {typeof f === 'string' ? f : f.feature}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Why Learn */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50">
                <CardTitle>
                  Why Learn {displayData.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Introduction</Label>
                      <Textarea
                        value={editData.whyLearnIntro || ''}
                        onChange={(e) => updateEditField('whyLearnIntro', e.target.value)}
                        rows={3}
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>
                    {(editData.whyLearn || []).map((item, i) => (
                      <div key={i} className="space-y-2 p-4 border border-amber-200 rounded bg-amber-50">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm text-gray-700">Item {i + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem('whyLearn', i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={item.title}
                          onChange={(e) => updateArrayItem('whyLearn', i, { ...item, title: e.target.value })}
                          placeholder="Title"
                          className="border-amber-300 focus:border-amber-500"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateArrayItem('whyLearn', i, { ...item, description: e.target.value })}
                          placeholder="Description"
                          rows={3}
                          className="border-amber-300 focus:border-amber-500"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('whyLearn')}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <>
                    {displayData.whyLearnIntro && (
                      <p className="mb-6 leading-relaxed text-gray-700">{displayData.whyLearnIntro}</p>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                      {displayData.whyLearn?.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="hover:text-amber-600 transition-colors text-gray-900">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 leading-relaxed">
                            {item.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {displayData.content?.length || 0} detailed lectures
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Content Items</Label>
                    {editData.content?.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={typeof c === 'string' ? c : c.content}
                          onChange={(e) => updateArrayItem('content', i, { content: e.target.value })}
                          placeholder="Content item"
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem('content', i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('content')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Content
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {displayData.content?.map((c, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 hover:bg-blue-50 rounded-lg transition-colors group border border-blue-100"
                      >
                        <BookOpen className="h-5 w-5 mt-1 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="leading-relaxed text-gray-700">
                          {typeof c === 'string' ? c : c.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing & Enrollment */}
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-xl">Course Enrollment</CardTitle>
                <CardDescription>
                  {displayData.status === "REGISTRATION_OPEN"
                    ? "Registration is open"
                    : displayData.status === "DRAFT"
                    ? "Draft mode"
                    : "Check status"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Price USD</Label>
                        <Input
                          type="number"
                          value={editData.priceUSD}
                          onChange={(e) => updateEditField('priceUSD', e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Price INR</Label>
                        <Input
                          type="number"
                          value={editData.priceINR}
                          onChange={(e) => updateEditField('priceINR', e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Status</Label>
                        <select
                          value={editData.status}
                          onChange={(e) => updateEditField('status', e.target.value)}
                          className="w-full p-2 border border-blue-300 rounded focus:border-blue-500"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="REGISTRATION_OPEN">REGISTRATION OPEN</option>
                          <option value="ONGOING">ONGOING</option>
                          <option value="UPCOMING">UPCOMING</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-blue-600">
                          ${Number(displayData.priceUSD).toLocaleString()}
                        </span>
                        <Badge
                          className={`text-white ${getStatusColor(displayData.status)}`}
                        >
                          {displayData.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium text-amber-600">
                        ₹{Number(displayData.priceINR).toLocaleString("en-IN")}
                      </p>
                    </>
                  )}

                  <Separator />

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Start Date</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(editData.startDate ||"")}
                          onChange={(e) => updateEditField('startDate', e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">End Date</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(editData.endDate ||"")}
                          onChange={(e) => updateEditField('endDate', e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Max Students</Label>
                        <Input
                          type="number"
                          value={editData.maxStudents || ''}
                          onChange={(e) => updateEditField('maxStudents', e.target.value)}
                          className="border-blue-300 focus:border-blue-500" 
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Current Enrollments</Label>
                        <Input
                          type="number"
                          value={editData.currentEnrollments}
                          onChange={(e) => updateEditField('currentEnrollments', e.target.value)}
                          className="border-blue-300 focus:border-blue-500"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date</span>
                        <span className="font-medium text-gray-900">{formatDate(displayData.startDate||"")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date</span>
                        <span className="font-medium text-gray-900">{formatDate(displayData.endDate||"")}</span>
                      </div>
                      {displayData.maxStudents && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats</span>
                          <span className="font-medium text-gray-900">
                            {displayData.currentEnrollments}/{displayData.maxStudents}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Admin Actions */}
                  <div className="space-y-2">
                    {!isEditing ? (
                      <>
                        <Button asChild variant="outline" className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50">
                          <Link href={`/courses/${displayData.slug}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            View Live Page
                          </Link>
                        </Button>
                        <Button 
                          className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                          onClick={handleEdit}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={handleDelete}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="w-full justify-start bg-green-600 hover:bg-green-700"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 text-center italic">
                    Last updated: {new Date(displayData.updatedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-50">
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Slug</span>
                  {isEditing ? (
                    <Input
                      value={editData.slug}
                      onChange={(e) => updateEditField('slug', e.target.value)}
                      className="w-40 border-blue-300 focus:border-blue-500"
                    />
                  ) : (
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{displayData.slug}</code>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">{new Date(displayData.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}