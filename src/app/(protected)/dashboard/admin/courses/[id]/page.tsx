"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  PlayCircle,
  Trash2,
  Users,
  Save,
  X,
  Plus
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
        alert("Course updated successfully!");
        setIsEditing(false);
        fetchCourse();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update course");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Course deleted successfully");
        router.push("/dashboard/courses");
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Error deleting course");
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
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
    </div>
  );

  if (!course || !editData) return (
    <div className="container mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Course Not Found</h2>
      <Button asChild>
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/admin/courses"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>
              <Badge variant="outline" className="text-xs">
                ADMIN VIEW
              </Badge>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => updateEditField('title', e.target.value)}
                    className="text-2xl font-bold"
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={editData.tagline || ''}
                    onChange={(e) => updateEditField('tagline', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {displayData.title}
                </h1>
                {displayData.tagline && (
                  <p className="text-xl text-muted-foreground mb-6">{displayData.tagline}</p>
                )}
              </>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <Label>Topics</Label>
                  {(editData.topics || []).map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={typeof t === 'string' ? t : t.topic}
                        onChange={(e) => updateArrayItem('topics', i, { topic: e.target.value })}
                        placeholder="Topic"
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
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Topic
                  </Button>
                </div>
              ) : (
                displayData.topics?.map((t) => (
                  <Badge
                    key={typeof t === 'string' ? t : t.topic}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 transition-colors"
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
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => updateEditField('description', e.target.value)}
                    rows={6}
                    className="mb-6"
                  />
                ) : (
                  <p className="mb-6 leading-relaxed whitespace-pre-wrap">
                    {displayData.description || "No description provided."}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <div className="flex-1">
                      <div className="font-medium">Instructor</div>
                      {isEditing ? (
                        <Input
                          value={editData.instructor || ''}
                          onChange={(e) => updateEditField('instructor', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          {displayData.instructor || "To be announced"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-purple-500" />
                    <div className="flex-1">
                      <div className="font-medium">Duration</div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editData.duration || ''}
                            onChange={(e) => updateEditField('duration', e.target.value)}
                            placeholder="25 live sessions"
                          />
                          <Input
                            type="number"
                            value={editData.totalSessions || ''}
                            onChange={(e) => updateEditField('totalSessions', e.target.value)}
                            placeholder="Sessions count"
                          />
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          {displayData.duration || "Not specified"}
                          {displayData.totalSessions && ` • ${displayData.totalSessions} sessions`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Features</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    {(editData.features || []).map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={typeof f === 'string' ? f : f.feature}
                          onChange={(e) => updateArrayItem('features', i, { feature: e.target.value })}
                          placeholder="Feature"
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
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {displayData.features?.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="leading-snug">{typeof f === 'string' ? f : f.feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Why Learn */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Why Learn {displayData.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Introduction</Label>
                      <Textarea
                        value={editData.whyLearnIntro || ''}
                        onChange={(e) => updateEditField('whyLearnIntro', e.target.value)}
                        rows={3}
                      />
                    </div>
                    {(editData.whyLearn || []).map((item, i) => (
                      <div key={i} className="space-y-2 p-4 border rounded">
                        <div className="flex justify-between">
                          <Label>Item {i + 1}</Label>
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
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateArrayItem('whyLearn', i, { ...item, description: e.target.value })}
                          placeholder="Description"
                          rows={3}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('whyLearn')}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                ) : (
                  <>
                    {displayData.whyLearnIntro && (
                      <p className="mb-6 leading-relaxed">{displayData.whyLearnIntro}</p>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                      {displayData.whyLearn?.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="hover:text-purple-500 transition-colors">
                            {item.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
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
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Content</CardTitle>
                <CardDescription>
                  {displayData.content?.length || 0} detailed lectures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    {editData.content?.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={typeof c === 'string' ? c : c.content}
                          onChange={(e) => updateArrayItem('content', i, { content: e.target.value })}
                          placeholder="Content item"
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
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Content
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {displayData.content?.map((c, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 hover:bg-muted rounded-lg transition-colors group"
                      >
                        <BookOpen className="h-5 w-5 mt-1 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="leading-relaxed">{typeof c === 'string' ? c : c.content}</span>
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
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">Course Enrollment</CardTitle>
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
                      <div>
                        <Label>Price USD</Label>
                        <Input
                          type="number"
                          value={editData.priceUSD}
                          onChange={(e) => updateEditField('priceUSD', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Price INR</Label>
                        <Input
                          type="number"
                          value={editData.priceINR}
                          onChange={(e) => updateEditField('priceINR', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          value={editData.status}
                          onChange={(e) => updateEditField('status', e.target.value)}
                          className="w-full p-2 border rounded"
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
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                          ${Number(displayData.priceUSD).toLocaleString()}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-white ${getStatusColor(displayData.status)}`}
                        >
                          {displayData.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium text-muted-foreground">
                        ₹{Number(displayData.priceINR).toLocaleString("en-IN")}
                      </p>
                    </>
                  )}

                  <Separator />

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(editData.startDate ||"")}
                          onChange={(e) => updateEditField('startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formatDateForInput(editData.endDate ||"")}
                          onChange={(e) => updateEditField('endDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Max Students</Label>
                        <Input
                          type="number"
                          value={editData.maxStudents || ''}
                          onChange={(e) => updateEditField('maxStudents', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Current Enrollments</Label>
                        <Input
                          type="number"
                          value={editData.currentEnrollments}
                          onChange={(e) => updateEditField('currentEnrollments', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium">{formatDate(displayData.startDate||"")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-medium">{formatDate(displayData.endDate||"")}</span>
                      </div>
                      {displayData.maxStudents && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seats</span>
                          <span className="font-medium">
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
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href={`/courses/${displayData.slug}`} target="_blank">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            View Live Page
                          </Link>
                        </Button>
                        <Button className="w-full justify-start" onClick={handleEdit}>
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
                          className="w-full justify-start"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center italic">
                    Last updated: {new Date(displayData.updatedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug</span>
                  {isEditing ? (
                    <Input
                      value={editData.slug}
                      onChange={(e) => updateEditField('slug', e.target.value)}
                      className="w-40"
                    />
                  ) : (
                    <code className="bg-muted px-2 py-1 rounded text-xs">{displayData.slug}</code>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(displayData.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}