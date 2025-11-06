import { db } from "@/db";
import { BlogsTable, BlogTagsTable, UsersTable,  } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Base query – always include the author join and published filter
    let query = db
      .select({
        id: BlogsTable.id,
        slug: BlogsTable.slug,
        title: BlogsTable.title,
        excerpt: BlogsTable.excerpt,
        thumbnailUrl: BlogsTable.thumbnailUrl,
        publishedAt: BlogsTable.publishedAt,
        viewCount: BlogsTable.viewCount,
        authorName: UsersTable.name,
      })
      .from(BlogsTable)
      .leftJoin(UsersTable, eq(BlogsTable.authorId, UsersTable.id))
      .where(eq(BlogsTable.isPublished, true))
      .orderBy(desc(BlogsTable.publishedAt));

    // If a tag is provided, join the tags table and filter
    if (tag) {
      query = query
        .leftJoin(BlogTagsTable, eq(BlogsTable.id, BlogTagsTable.blogId))
        .where(
          and(
            eq(BlogsTable.isPublished, true),
            eq(BlogTagsTable.tag, tag)
          )
        );
    }

    // Pagination must come **after** all joins/filters
    const blogs = await query.limit(limit).offset(offset);

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}