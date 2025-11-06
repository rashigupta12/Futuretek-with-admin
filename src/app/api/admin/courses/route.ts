// app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CoursesTable, CourseFeaturesTable, CourseWhyLearnTable, CourseContentTable, CourseTopicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - List all courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db.select().from(CoursesTable);

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
      priceINR,
      priceUSD,
      status,
      features,
      whyLearn,
      content,
      topics,
      ...rest
    } = body;

    // Create course
    const [course] = await db
      .insert(CoursesTable)
      .values({
        slug,
        title,
        tagline,
        description,
        instructor,
        duration,
        totalSessions,
        priceINR,
        priceUSD,
        status,
        ...rest,
      })
      .returning();

    // Insert features
    if (features && features.length > 0) {
      await db.insert(CourseFeaturesTable).values(
        features.map((feature: string, index: number) => ({
          courseId: course.id,
          feature,
          sortOrder: index,
        }))
      );
    }

    // Insert why learn points
    if (whyLearn && whyLearn.length > 0) {
      await db.insert(CourseWhyLearnTable).values(
        whyLearn.map((item: any, index: number) => ({
          courseId: course.id,
          title: item.title,
          description: item.description,
          sortOrder: index,
        }))
      );
    }

    // Insert content
    if (content && content.length > 0) {
      await db.insert(CourseContentTable).values(
        content.map((item: string, index: number) => ({
          courseId: course.id,
          content: item,
          sortOrder: index,
        }))
      );
    }

    // Insert topics
    if (topics && topics.length > 0) {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}