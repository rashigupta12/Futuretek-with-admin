import { db } from "@/db";
import { CourseContentTable, CourseFeaturesTable, CoursesTable, CourseTopicsTable, CourseWhyLearnTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// app/api/courses/[slug]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.slug, params.slug))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch related data
    const features = await db
      .select()
      .from(CourseFeaturesTable)
      .where(eq(CourseFeaturesTable.courseId, course.id));

    const whyLearn = await db
      .select()
      .from(CourseWhyLearnTable)
      .where(eq(CourseWhyLearnTable.courseId, course.id));

    const content = await db
      .select()
      .from(CourseContentTable)
      .where(eq(CourseContentTable.courseId, course.id));

    const topics = await db
      .select()
      .from(CourseTopicsTable)
      .where(eq(CourseTopicsTable.courseId, course.id));

    return NextResponse.json(
      {
        course: {
          ...course,
          features: features.map((f) => f.feature),
          whyLearn: whyLearn.map((w) => ({
            title: w.title,
            description: w.description,
          })),
          content: content.map((c) => c.content),
          topics: topics.map((t) => t.topic),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}