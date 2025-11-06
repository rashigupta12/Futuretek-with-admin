/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { CoursesTable, CourseFeaturesTable, CourseWhyLearnTable, CourseContentTable, CourseTopicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
// GET - Get single course
export async function GET(
  req: NextRequest,
 context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params;  
  try {
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.id, params.id))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch related data
    const features = await db
      .select()
      .from(CourseFeaturesTable)
      .where(eq(CourseFeaturesTable.courseId, params.id));

    const whyLearn = await db
      .select()
      .from(CourseWhyLearnTable)
      .where(eq(CourseWhyLearnTable.courseId, params.id));

    const content = await db
      .select()
      .from(CourseContentTable)
      .where(eq(CourseContentTable.courseId, params.id));

    const topics = await db
      .select()
      .from(CourseTopicsTable)
      .where(eq(CourseTopicsTable.courseId, params.id));

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

// PUT - Update course
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params;  
  try {
    const body = await req.json();
    const { features, whyLearn, content, topics, ...courseData } = body;

    // Update course
    const [updatedCourse] = await db
      .update(CoursesTable)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(CoursesTable.id, params.id))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update features
    if (features) {
      await db
        .delete(CourseFeaturesTable)
        .where(eq(CourseFeaturesTable.courseId, params.id));
      
      if (features.length > 0) {
        await db.insert(CourseFeaturesTable).values(
          features.map((feature: string, index: number) => ({
            courseId: params.id,
            feature,
            sortOrder: index,
          }))
        );
      }
    }

    // Update why learn
    if (whyLearn) {
      await db
        .delete(CourseWhyLearnTable)
        .where(eq(CourseWhyLearnTable.courseId, params.id));
      
      if (whyLearn.length > 0) {
        await db.insert(CourseWhyLearnTable).values(
          whyLearn.map((item: any, index: number) => ({
            courseId: params.id,
            title: item.title,
            description: item.description,
            sortOrder: index,
          }))
        );
      }
    }

    // Update content
    if (content) {
      await db
        .delete(CourseContentTable)
        .where(eq(CourseContentTable.courseId, params.id));
      
      if (content.length > 0) {
        await db.insert(CourseContentTable).values(
          content.map((item: string, index: number) => ({
            courseId: params.id,
            content: item,
            sortOrder: index,
          }))
        );
      }
    }

    // Update topics
    if (topics) {
      await db
        .delete(CourseTopicsTable)
        .where(eq(CourseTopicsTable.courseId, params.id));
      
      if (topics.length > 0) {
        await db.insert(CourseTopicsTable).values(
          topics.map((topic: string) => ({
            courseId: params.id,
            topic,
          }))
        );
      }
    }

    return NextResponse.json(
      { message: "Course updated successfully", course: updatedCourse },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
  req: NextRequest,
 context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params;  
  try {
    await db.delete(CoursesTable).where(eq(CoursesTable.id, params.id));

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}