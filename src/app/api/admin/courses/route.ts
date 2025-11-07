/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CoursesTable, CourseFeaturesTable, CourseWhyLearnTable, CourseContentTable, CourseTopicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - List all courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query = db.select().from(CoursesTable);

    // Define allowed status values as a type and array
    type CourseStatus = "COMPLETED" | "DRAFT" | "UPCOMING" | "REGISTRATION_OPEN" | "ONGOING" | "ARCHIVED";
    const allowedStatuses: CourseStatus[] = [
      "COMPLETED",
      "DRAFT",
      "UPCOMING",
      "REGISTRATION_OPEN",
      "ONGOING",
      "ARCHIVED"
    ];

    const typedStatus = allowedStatuses.includes(status as CourseStatus)
      ? (status as CourseStatus)
      : undefined;

    const courses = await (typedStatus
      ? query.where(eq(CoursesTable.status, typedStatus))
      : query);

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}


// POST - Create new course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      title,
      tagline,
      description,
      instructor,
      duration,
      totalSessions,
      price,        // ← incoming
      forexPrice,   // ← incoming
      status,
      thumbnail,    // if any
      startDate,
      endDate,
      features,
      whyLearn,
      content,
      topics,
      ...rest
    } = body;

    // Map frontend fields → DB column names
    const courseData = {
      slug,
      title,
      tagline: tagline || null,
      description,
      instructor: instructor || null,
      duration: duration || null,
      totalSessions: totalSessions || null,
      price_inr: price ?? null,           // ← map 'price' → 'price_inr'
      price_usd: forexPrice ?? null,      // ← map 'forexPrice' → 'price_usd'
      status,
      thumbnail_url: thumbnail || null,
      start_date: startDate || null,
      end_date: endDate || null,
      registration_deadline: null,
      why_learn_intro: null,
      what_you_learn: null,
      disclaimer: null,
      max_students: null,
      current_enrollments: 0,
      ...rest,
    };

    // Insert course
    const [course] = await db
      .insert(CoursesTable)
      .values(courseData)
      .returning();

    // === Insert related data (unchanged) ===
    if (features?.length) {
      await db.insert(CourseFeaturesTable).values(
        features.map((feature: string, index: number) => ({
          courseId: course.id,
          feature,
          sortOrder: index,
        }))
      );
    }

    if (whyLearn?.length) {
      await db.insert(CourseWhyLearnTable).values(
        whyLearn.map((item: any, index: number) => ({
          courseId: course.id,
          title: item.title,
          description: item.description,
          sortOrder: index,
        }))
      );
    }

    if (content?.length) {
      await db.insert(CourseContentTable).values(
        content.map((item: string, index: number) => ({
          courseId: course.id,
          content: item,
          sortOrder: index,
        }))
      );
    }

    if (topics?.length) {
      await db.insert(CourseTopicsTable).values(
        topics.map((topic: string) => ({
          courseId: course.id,
          topic,
        }))
      );
    }

    return NextResponse.json(
      { message: "Course created successfully", course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Course creation error:", error); // Log for debugging
    return NextResponse.json(
      { error: "Failed to create course", details: error.message },
      { status: 500 }
    );
  }
}