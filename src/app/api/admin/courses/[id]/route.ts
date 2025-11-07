/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  CoursesTable,
  CourseFeaturesTable,
  CourseWhyLearnTable,
  CourseContentTable,
  CourseTopicsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get single course
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <-- params is now a Promise
) {
  const { id: slug } = await context.params; // <-- await params

  try {
    // 1. Fetch the main course row by slug
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.slug, slug))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // 2. Fetch related tables using the course.id (UUID)
    const [features, whyLearn, content, topics] = await Promise.all([
      db
        .select()
        .from(CourseFeaturesTable)
        .where(eq(CourseFeaturesTable.courseId, course.id)),

      db
        .select()
        .from(CourseWhyLearnTable)
        .where(eq(CourseWhyLearnTable.courseId, course.id)),

      db
        .select()
        .from(CourseContentTable)
        .where(eq(CourseContentTable.courseId, course.id)),

      db
        .select()
        .from(CourseTopicsTable)
        .where(eq(CourseTopicsTable.courseId, course.id)),
    ]);

    // 3. Shape the response
    return NextResponse.json(
      {
        ...course,
        features: features.map((f) => ({ feature: f.feature })),
        whyLearn: whyLearn.map((w) => ({
          title: w.title,
          description: w.description,
        })),
        content: content.map((c) => ({ content: c.content })),
        topics: topics.map((t) => ({ topic: t.topic })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/courses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT - Update course
// PUT - Update course
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;  
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { features, whyLearn, content, topics, ...courseData } = body;

    // --- CRITICAL FIX: Convert date strings to Date objects ---
    const dateFields = ["createdAt", "updatedAt", "startDate", "endDate"] as const;

    const cleanedCourseData = { ...courseData };

    for (const field of dateFields) {
      if (cleanedCourseData[field] != null) {
        // If it's a string like "2025-11-07T...", convert to Date
        if (typeof cleanedCourseData[field] === "string") {
          cleanedCourseData[field] = new Date(cleanedCourseData[field]);
        }
        // If it's already a Date, leave it
      }
    }

    // Always set updatedAt to now
    cleanedCourseData.updatedAt = new Date();

    // --- End Fix ---

    // Update course
    const [updatedCourse] = await db
      .update(CoursesTable)
      .set(cleanedCourseData)
      .where(eq(CoursesTable.id, id))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // --- Rest of your code (features, whyLearn, etc.) remains unchanged ---
    if (features !== undefined) {
      await db.delete(CourseFeaturesTable).where(eq(CourseFeaturesTable.courseId, id));
      if (features.length > 0) {
        await db.insert(CourseFeaturesTable).values(
          features.map((feature: string, index: number) => ({
            courseId: id,
            feature,
            sortOrder: index,
          }))
        );
      }
    }

    if (whyLearn !== undefined) {
      await db.delete(CourseWhyLearnTable).where(eq(CourseWhyLearnTable.courseId, id));
      if (whyLearn.length > 0) {
        await db.insert(CourseWhyLearnTable).values(
          whyLearn.map((item: any, index: number) => ({
            courseId: id,
            title: item.title,
            description: item.description,
            sortOrder: index,
          }))
        );
      }
    }

    if (content !== undefined) {
      await db.delete(CourseContentTable).where(eq(CourseContentTable.courseId, id));
      if (content.length > 0) {
        await db.insert(CourseContentTable).values(
          content.map((item: string, index: number) => ({
            courseId: id,
            content: item,
            sortOrder: index,
          }))
        );
      }
    }

    if (topics !== undefined) {
      await db.delete(CourseTopicsTable).where(eq(CourseTopicsTable.courseId, id));
      if (topics.length > 0) {
        await db.insert(CourseTopicsTable).values(
          topics.map((topic: string) => ({
            courseId: id,
            topic,
          }))
        );
      }
    }

    return NextResponse.json(
      { message: "Course updated successfully", course: updatedCourse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PUT /api/admin/courses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update course", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <-- params is Promise
) {
  const params = await context.params;  
  try {
    const { id } = await context.params; // <-- await here

    await db.delete(CoursesTable).where(eq(CoursesTable.id, id));

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/courses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}