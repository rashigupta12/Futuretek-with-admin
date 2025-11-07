/*eslint-disable @typescript-eslint/no-explicit-any*/
// src/app/(protected)/dashboard/admin/blogs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Filter, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  isPublished: boolean;
  viewCount: number;

  publishedAt?: string;
  createdAt: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "ALL"
          ? "/api/admin/blogs"
          : `/api/admin/blogs?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();

      const mapped: Blog[] = (data.blogs || []).map((b: any) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || "",
        isPublished: b.isPublished,
        viewCount: b.viewCount ?? 0,
        authorName: b.authorName,
        publishedAt: b.publishedAt,
        createdAt: b.createdAt,
      }));

      setBlogs(mapped);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        alert("Blog deleted successfully");
      } else {
        alert("Failed to delete blog");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting blog");
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = ["ALL", "PUBLISHED", "DRAFT"];

  return (
    <div className="p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Blogs</h2>
          <p className="text-muted-foreground mt-1">
            Manage your blog posts, create new ones, and track engagement.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/blogs/add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Blog
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All Status" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading blogs...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No blogs found. Create your first blog post!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{blog.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {blog.excerpt}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={blog.isPublished ? "default" : "secondary"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>


                    <td className="px-6 py-4 text-sm text-foreground">
                      {blog.viewCount}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString("en-IN")
                        : "Not published"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-0">
                          <div className="flex flex-col">
                            <Link href={`/dashboard/admin/blogs/${blog.slug}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/dashboard/admin/blogs/edit/${blog.slug}`}>
                              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 rounded-none"
                              onClick={() => handleDelete(blog.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}