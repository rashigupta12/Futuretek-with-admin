// This function should be called when a payment is completed with a Jyotishi coupon
import { db } from "@/db";
import {
  CommissionsTable,
  CouponsTable,
  PaymentsTable,
  UsersTable
} from "@/db/schema";
import { eq } from "drizzle-orm";
export async function createCommissionRecord(
  paymentId: string,
  courseId: string,
  userId: string,
  couponId: string,
  saleAmount: number
) {
  try {
    // Get coupon and creator (Jyotishi) details
    const [coupon] = await db
      .select({
        id: CouponsTable.id,
        createdBy: CouponsTable.createdBy,
      })
      .from(CouponsTable)
      .where(eq(CouponsTable.id, couponId))
      .limit(1);

    if (!coupon) return;

    // Get Jyotishi commission rate
    const [jyotishi] = await db
      .select({
        id: UsersTable.id,
        commissionRate: UsersTable.commissionRate,
        role: UsersTable.role,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, coupon.createdBy))
      .limit(1);

    // Only create commission if creator is a Jyotishi
    if (!jyotishi || jyotishi.role !== "JYOTISHI" || !jyotishi.commissionRate) {
      return;
    }

    const commissionRate = parseFloat(jyotishi.commissionRate);
    const commissionAmount = (saleAmount * commissionRate) / 100;

    // Create commission record
    const [commission] = await db
      .insert(CommissionsTable)
      .values({
        jyotishiId: jyotishi.id,
        paymentId,
        courseId,
        studentId: userId,
        couponId,
        commissionRate: commissionRate.toString(),
        saleAmount: saleAmount.toString(),
        commissionAmount: commissionAmount.toString(),
        status: "PENDING",
      })
      .returning();

    // Update payment with commission info
    await db
      .update(PaymentsTable)
      .set({
        jyotishiId: jyotishi.id,
        commissionAmount: commissionAmount.toString(),
        commissionPaid: false,
      })
      .where(eq(PaymentsTable.id, paymentId));

    return commission;
  } catch (error) {
    console.error("Error creating commission record:", error);
    throw error;
  }
}
