// src/app/api/admin/recent-activity/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import {
  BlogsTable,
  CertificateRequestsTable,
  CoursesTable,
  EnrollmentsTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";


interface Activity {
  id: string;
  action: string;
  time: string;
  type: "enrollment" | "certificate" | "blog" | "payment";
  color: "blue" | "amber" | "indigo" | "emerald";
  createdAt: Date; // Add actual timestamp for sorting
  metadata?: {
    userName?: string;
    courseName?: string;
    amount?: number;
    blogTitle?: string;
  };
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const activities: Activity[] = [];

    // Fetch recent enrollments (last 5)
    const recentEnrollments = await db
      .select({
        id: EnrollmentsTable.id,
        enrolledAt: EnrollmentsTable.enrolledAt,
        courseName: CoursesTable.title,
        userName: UsersTable.name,
      })
      .from(EnrollmentsTable)
      .innerJoin(CoursesTable, eq(EnrollmentsTable.courseId, CoursesTable.id))
      .innerJoin(UsersTable, eq(EnrollmentsTable.userId, UsersTable.id))
      .orderBy(desc(EnrollmentsTable.enrolledAt))
      .limit(5);

    recentEnrollments.forEach(enrollment => {
      activities.push({
        id: enrollment.id,
        action: `New enrollment in ${enrollment.courseName}`,
        time: getRelativeTime(new Date(enrollment.enrolledAt)),
        createdAt: new Date(enrollment.enrolledAt),
        type: "enrollment",
        color: "blue",
        metadata: {
          userName: enrollment.userName,
          courseName: enrollment.courseName
        }
      });
    });

    // Fetch recent certificate requests (last 3)
    const recentCertRequests = await db
      .select({
        id: CertificateRequestsTable.id,
        requestedAt: CertificateRequestsTable.requestedAt,
        userName: UsersTable.name,
        status: CertificateRequestsTable.status,
      })
      .from(CertificateRequestsTable)
      .innerJoin(UsersTable, eq(CertificateRequestsTable.userId, UsersTable.id))
      .where(eq(CertificateRequestsTable.status, "PENDING"))
      .orderBy(desc(CertificateRequestsTable.requestedAt))
      .limit(3);

    recentCertRequests.forEach(request => {
      activities.push({
        id: request.id,
        action: `Certificate request from ${request.userName}`,
        time: getRelativeTime(new Date(request.requestedAt)),
        createdAt: new Date(request.requestedAt),
        type: "certificate",
        color: "amber",
        metadata: {
          userName: request.userName
        }
      });
    });

    // Fetch recent blog posts (last 3)
    const recentBlogs = await db
      .select({
        id: BlogsTable.id,
        publishedAt: BlogsTable.publishedAt,
        title: BlogsTable.title,
        authorName: UsersTable.name,
      })
      .from(BlogsTable)
      .innerJoin(UsersTable, eq(BlogsTable.authorId, UsersTable.id))
      .where(eq(BlogsTable.isPublished, true))
      .orderBy(desc(BlogsTable.publishedAt))
      .limit(3);

    recentBlogs.forEach(blog => {
      if (blog.publishedAt) {
        activities.push({
          id: blog.id,
          action: `New blog post: ${blog.title}`,
          time: getRelativeTime(new Date(blog.publishedAt)),
          createdAt: new Date(blog.publishedAt),
          type: "blog",
          color: "indigo",
          metadata: {
            blogTitle: blog.title
          }
        });
      }
    });

    // Fetch recent payments (last 5)
    const recentPayments = await db
      .select({
        id: PaymentsTable.id,
        createdAt: PaymentsTable.createdAt,
        finalAmount: PaymentsTable.finalAmount,
        currency: PaymentsTable.currency,
        userName: UsersTable.name,
      })
      .from(PaymentsTable)
      .innerJoin(UsersTable, eq(PaymentsTable.userId, UsersTable.id))
      .where(eq(PaymentsTable.status, "COMPLETED"))
      .orderBy(desc(PaymentsTable.createdAt))
      .limit(5);

    recentPayments.forEach(payment => {
      const amount = parseFloat(payment.finalAmount);
      const formattedAmount = payment.currency === "INR" 
        ? `₹${amount.toLocaleString("en-IN")}`
        : `$${amount.toFixed(2)}`;

      activities.push({
        id: payment.id,
        action: `Payment received - ${formattedAmount}`,
        time: getRelativeTime(new Date(payment.createdAt)),
        createdAt: new Date(payment.createdAt),
        type: "payment",
        color: "emerald",
        metadata: {
          amount: amount,
          userName: payment.userName
        }
      });
    });

    // Sort all activities by timestamp (most recent first)
    const sortedActivities = activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10); // Return only top 10 most recent

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error("Admin recent activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}