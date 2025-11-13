/*eslint-disable @typescript-eslint/no-explicit-any*/
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
  CouponCoursesTable,
  UsersTable,
} from "@/db/schema";
import { eq, and, gt, lt, or, isNull, notExists } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;

  try {
    // Fetch base course
    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.slug, params.slug))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch related course data
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

    // Handle coupon logic
    const session = await auth();
    let finalPrice = parseFloat(course.priceINR);
    let totalDiscountAmount = 0;
    let adminDiscountAmount = 0;
    let jyotishiDiscountAmount = 0;
    let priceAfterAdminDiscount = finalPrice;
    const appliedCoupons: any[] = [];
    let hasAssignedCoupon = false;

    if (session?.user?.id) {
      const userId = session.user.id;
      let currentPrice = finalPrice;

      // 1️⃣ Personal coupons (assigned to this user for this course)
      const personalCoupons = await db
        .select({
          coupon: CouponsTable,
          couponType: CouponTypesTable,
          creator: UsersTable,
          assignment: UserCourseCouponsTable,
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
        .leftJoin(
          UsersTable,
          eq(CouponsTable.createdByJyotishiId, UsersTable.id)
        )
        .where(
          and(
            eq(UserCourseCouponsTable.userId, userId),
            eq(UserCourseCouponsTable.courseId, course.id),
            eq(CouponsTable.isActive, true),
            lt(CouponsTable.validFrom, new Date()),
            gt(CouponsTable.validUntil, new Date()),
            or(
              isNull(CouponsTable.maxUsageCount),
              lt(CouponsTable.currentUsageCount, CouponsTable.maxUsageCount)
            )
          )
        );

      console.log(
        "Personal coupons for user",
        userId,
        "course",
        course.id,
        ":",
        personalCoupons.length
      );

      // 2️⃣ General coupons (available to everyone, not personally assigned)
      const generalCoupons = await db
        .select({
          coupon: CouponsTable,
          couponType: CouponTypesTable,
          creator: UsersTable,
        })
        .from(CouponsTable)
        .innerJoin(
          CouponTypesTable,
          eq(CouponsTable.couponTypeId, CouponTypesTable.id)
        )
        .leftJoin(
          UsersTable,
          eq(CouponsTable.createdByJyotishiId, UsersTable.id)
        )
        .leftJoin(
          CouponCoursesTable,
          eq(CouponCoursesTable.couponId, CouponsTable.id)
        )
        .where(
          and(
            eq(CouponsTable.isActive, true),
            lt(CouponsTable.validFrom, new Date()),
            gt(CouponsTable.validUntil, new Date()),
            or(
              isNull(CouponsTable.maxUsageCount),
              lt(CouponsTable.currentUsageCount, CouponsTable.maxUsageCount)
            ),
            notExists(
              db
                .select()
                .from(UserCourseCouponsTable)
                .where(eq(UserCourseCouponsTable.couponId, CouponsTable.id))
            ),
            or(
              isNull(CouponCoursesTable.id),
              eq(CouponCoursesTable.courseId, course.id)
            )
          )
        )
        .groupBy(CouponsTable.id, CouponTypesTable.id, UsersTable.id);

      console.log(
        "General coupons for course",
        course.id,
        ":",
        generalCoupons.length
      );

      // ✅ Fix type issue here by normalizing structures
      type CouponData = {
        coupon: typeof CouponsTable.$inferSelect;
        couponType: typeof CouponTypesTable.$inferSelect;
        creator: typeof UsersTable.$inferSelect | null;
        assignment?: typeof UserCourseCouponsTable.$inferSelect | null;
      };

      const allApplicableCoupons: CouponData[] = [
        ...personalCoupons,
        ...generalCoupons.map((gc) => ({ ...gc, assignment: null })),
      ];

      // Remove duplicates (same coupon from multiple sources)
      const uniqueCoupons = allApplicableCoupons.filter(
        (coupon, index, self) =>
          index === self.findIndex((c) => c.coupon.id === coupon.coupon.id)
      );

      console.log("Total unique applicable coupons:", uniqueCoupons.length);

      // Separate coupons by creator type
      const adminCoupons = uniqueCoupons.filter(
        (c) => c.creator?.role === "ADMIN" || c.coupon.createdByJyotishiId === null
      );
      const jyotishiCoupons = uniqueCoupons.filter(
        (c) => c.creator?.role === "JYOTISHI" && c.coupon.createdByJyotishiId !== null
      );

      console.log("Admin coupons:", adminCoupons.length);
      console.log("Jyotishi coupons:", jyotishiCoupons.length);

      // Apply admin coupons first
      for (const couponData of adminCoupons) {
        const { coupon, creator, assignment } = couponData;
        let discountAmount = 0;

        if (coupon.discountType === "FIXED_AMOUNT") {
          discountAmount = Math.min(
            parseFloat(coupon.discountValue),
            currentPrice
          );
        } else {
          discountAmount = (currentPrice * parseFloat(coupon.discountValue)) / 100;
        }

        if (discountAmount > 0) {
          currentPrice -= discountAmount;
          totalDiscountAmount += discountAmount;
          adminDiscountAmount += discountAmount;

          appliedCoupons.push({
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            creatorType: "ADMIN" as const,
            creatorName: creator?.name,
            isPersonal: !!assignment,
          });

          if (assignment) hasAssignedCoupon = true;
        }
      }

      // Update price after admin discounts for commission calculation
      priceAfterAdminDiscount = currentPrice;

      // Apply jyotishi coupons second
      for (const couponData of jyotishiCoupons) {
        const { coupon, creator, assignment } = couponData;
        let discountAmount = 0;

        if (coupon.discountType === "FIXED_AMOUNT") {
          discountAmount = Math.min(
            parseFloat(coupon.discountValue),
            currentPrice
          );
        } else {
          discountAmount = (currentPrice * parseFloat(coupon.discountValue)) / 100;
        }

        if (discountAmount > 0) {
          currentPrice -= discountAmount;
          totalDiscountAmount += discountAmount;
          jyotishiDiscountAmount += discountAmount;

          appliedCoupons.push({
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            creatorType: "JYOTISHI" as const,
            creatorName: creator?.name,
            isPersonal: !!assignment,
          });

          if (assignment) hasAssignedCoupon = true;
        }
      }

      finalPrice = Math.max(0, currentPrice);
    }

    // ✅ Return response
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
          originalPrice: course.priceINR,
          finalPrice: finalPrice.toFixed(2),
          discountAmount: totalDiscountAmount.toFixed(2),
          adminDiscountAmount: adminDiscountAmount.toFixed(2),
          jyotishiDiscountAmount: jyotishiDiscountAmount.toFixed(2),
          priceAfterAdminDiscount: priceAfterAdminDiscount.toFixed(2),
          appliedCoupons: appliedCoupons.length > 0 ? appliedCoupons : null,
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