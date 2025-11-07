// src/app/(protected)/dashboard/admin/blogs/[slug]/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Trash2,
  User
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  viewCount: number;
  authorName?: string;
  authorEmail?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export default function ViewBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) fetchBlog();
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blogs/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      setBlog({
        ...data.blog,
        tags: data.blog.tags || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/${blog?.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Blog deleted successfully");
        router.push("/dashboard/admin/blogs");
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Error deleting blog");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
    </div>
  );

  if (!blog) return (
    <div className="container mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Blog Not Found</h2>
      <Button asChild>
        <Link href="/dashboard/admin/blogs">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blogs
        </Link>
      </Button>
    </div>
  );

  const formatDate = (d: string | null | undefined) => 
    d ? new Date(d).toLocaleDateString("en-IN", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : "Not set";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/dashboard/admin/blogs"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blogs
              </Link>
              <Badge variant="outline" className="text-xs">
                ADMIN VIEW
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{blog.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail */}
            {blog.thumbnailUrl && (
              <Card className="overflow-hidden">
                <img
                  src={blog.thumbnailUrl}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                />
              </Card>
            )}

            {/* Blog Content */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Author</div>
                    <div className="text-sm text-muted-foreground">
                      {blog.authorName || "Unknown"}
                      {blog.authorEmail && ` (${blog.authorEmail})`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Views</div>
                    <div className="text-sm text-muted-foreground">
                      {blog.viewCount.toLocaleString()} views
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">Status</CardTitle>
                <CardDescription>
                  {blog.isPublished ? "Published" : "Draft"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={blog.isPublished ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-muted-foreground">Published</div>
                        <div className="font-medium">{formatDate(blog.publishedAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-muted-foreground">Created</div>
                        <div className="font-medium">{formatDate(blog.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-muted-foreground">Updated</div>
                        <div className="font-medium">{formatDate(blog.updatedAt)}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Admin Actions */}
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href={`/blogs/${blog.slug}`} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        View Live Page
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start">
                      <Link href={`/dashboard/admin/blogs/edit/${blog.slug}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Blog
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Blog
                    </Button>
                  </div>
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
                  <code className="bg-muted px-2 py-1 rounded text-xs">{blog.slug}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs truncate max-w-[150px]">
                    {blog.id}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}