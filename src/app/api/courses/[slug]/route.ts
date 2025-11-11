// src/app/api/courses/[slug]/route.ts
import { auth } from "@/auth";
import { db } from "@/db";
import { 
  CourseContentTable, 
  CourseFeaturesTable, 
  CoursesTable, 
  CourseTopicsTable, 
  CourseWhyLearnTable,
  UserCourseCouponsTable,
  CouponsTable,
  CouponTypesTable,
  DiscountType
} from "@/db/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> } 
) {
  const params = await context.params;  
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

    // Get user session to check for assigned coupons
    const session = await auth();
    let finalPrice = parseFloat(course.priceINR);
    let discountAmount = 0;
    let appliedCoupon = null;
    let hasAssignedCoupon = false;

    // Check if user has an assigned coupon for this course
    if (session?.user?.id) {
      const userId = session.user.id;
      
      const userCouponAssignment = await db
        .select({
          coupon: CouponsTable,
          couponType: CouponTypesTable, // Join with coupon types to get maxDiscountLimit
        })
        .from(UserCourseCouponsTable)
        .innerJoin(
          CouponsTable,
          eq(UserCourseCouponsTable.couponId, CouponsTable.id)
        )
        .innerJoin(
          CouponTypesTable,
          eq(CouponsTable.couponTypeId, CouponTypesTable.id)
        )
        .where(
          and(
            eq(UserCourseCouponsTable.userId, userId),
            eq(UserCourseCouponsTable.courseId, course.id),
            eq(CouponsTable.isActive, true),
            lt(CouponsTable.validFrom, new Date()),
            gt(CouponsTable.validUntil, new Date())
          )
        )
        .limit(1);

      if (userCouponAssignment.length > 0) {
        const { coupon } = userCouponAssignment[0];
        appliedCoupon = coupon;
        hasAssignedCoupon = true;

        // Calculate discount
        if (coupon.discountType === DiscountType.enumValues[0]) { // PERCENTAGE
          discountAmount = (finalPrice * parseFloat(coupon.discountValue)) / 100;
          console.log(discountAmount)
         
          
        } else { // FIXED_AMOUNT
          discountAmount = parseFloat(coupon.discountValue);
         
        }

        finalPrice = finalPrice - discountAmount
      }

      console.log(finalPrice)
    }

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
          // Add pricing information with discount
          originalPrice: course.priceINR,
          finalPrice: finalPrice.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          appliedCoupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          } : null,
          hasAssignedCoupon,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}