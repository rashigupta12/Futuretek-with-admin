// app/api/admin/jyotishi/[id]/route.ts
/*eslint-disable @typescript-eslint/no-explicit-any*/

import { db } from "@/db";
import {
  CommissionsTable,
  CoursesTable,
  UsersTable
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Get Jyotishi details
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params; 
  try {
    const [jyotishi] = await db
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
        mobile: UsersTable.mobile,
        commissionRate: UsersTable.commissionRate,
        bankAccountNumber: UsersTable.bankAccountNumber,
        bankIfscCode: UsersTable.bankIfscCode,
        bankAccountHolderName: UsersTable.bankAccountHolderName,
        panNumber: UsersTable.panNumber,
        isActive: UsersTable.isActive,
        createdAt: UsersTable.createdAt,
      })
      .from(UsersTable)
      .where(
        and(eq(UsersTable.id, params.id), eq(UsersTable.role, "JYOTISHI"))
      )
      .limit(1);

    if (!jyotishi) {
      return NextResponse.json(
        { error: "Jyotishi not found" },
        { status: 404 }
      );
    }

    // Get commission statistics
    const [stats] = await db
      .select({
        totalCommission: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
        pendingCommission: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PENDING' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        paidCommission: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PAID' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(CommissionsTable)
      .where(eq(CommissionsTable.jyotishiId, params.id));

    // Get recent commissions
    const recentCommissions = await db
      .select({
        id: CommissionsTable.id,
        saleAmount: CommissionsTable.saleAmount,
        commissionAmount: CommissionsTable.commissionAmount,
        status: CommissionsTable.status,
        createdAt: CommissionsTable.createdAt,
        courseName: CoursesTable.title,
        studentName: UsersTable.name,
      })
      .from(CommissionsTable)
      .leftJoin(CoursesTable, eq(CommissionsTable.courseId, CoursesTable.id))
      .leftJoin(UsersTable, eq(CommissionsTable.studentId, UsersTable.id))
      .where(eq(CommissionsTable.jyotishiId, params.id))
      .orderBy(desc(CommissionsTable.createdAt))
      .limit(10);

    return NextResponse.json(
      {
        jyotishi,
        stats,
        recentCommissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jyotishi:", error);
    return NextResponse.json(
      { error: "Failed to fetch jyotishi details" },
      { status: 500 }
    );
  }
}

// PUT - Update Jyotishi
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params; 
  try {
    const body = await req.json();
    const {
      name,
      mobile,
      commissionRate,
      bankAccountNumber,
      bankIfscCode,
      bankAccountHolderName,
      panNumber,
      isActive,
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (bankAccountNumber) updateData.bankAccountNumber = bankAccountNumber;
    if (bankIfscCode) updateData.bankIfscCode = bankIfscCode;
    if (bankAccountHolderName)
      updateData.bankAccountHolderName = bankAccountHolderName;
    if (panNumber) updateData.panNumber = panNumber;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedJyotishi] = await db
      .update(UsersTable)
      .set(updateData)
      .where(
        and(eq(UsersTable.id, params.id), eq(UsersTable.role, "JYOTISHI"))
      )
      .returning();

    if (!updatedJyotishi) {
      return NextResponse.json(
        { error: "Jyotishi not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Jyotishi updated successfully",
        jyotishi: updatedJyotishi,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating jyotishi:", error);
    return NextResponse.json(
      { error: "Failed to update jyotishi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete Jyotishi (soft delete by deactivating)
export async function DELETE(
  req: NextRequest,
   context: { params: Promise<{ id: string }> } 
) {
  const params = await context.params;  
  try {
    const [jyotishi] = await db
      .update(UsersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(eq(UsersTable.id, params.id), eq(UsersTable.role, "JYOTISHI"))
      )
      .returning();

    if (!jyotishi) {
      return NextResponse.json(
        { error: "Jyotishi not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Jyotishi deactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting jyotishi:", error);
    return NextResponse.json(
      { error: "Failed to delete jyotishi" },
      { status: 500 }
    );
  }
}
