// =====================================================
// JYOTISHI API ROUTES
// =====================================================
/*eslint-disable @typescript-eslint/no-require-imports*/
/*eslint-disable  @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import {
  CommissionsTable,
  UsersTable
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// =====================================================
// 1. ADMIN - JYOTISHI MANAGEMENT
// =====================================================



// GET - List all Jyotishi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get("isActive");

    // Build conditions array
    const conditions = [eq(UsersTable.role, "JYOTISHI")];

    if (isActiveParam !== null) {
      const isActive = isActiveParam === "true";
      conditions.push(eq(UsersTable.isActive, isActive));
    }

    // Single query with all conditions
    const jyotishis = await db
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
        mobile: UsersTable.mobile,
        commissionRate: UsersTable.commissionRate,
        isActive: UsersTable.isActive,
        createdAt: UsersTable.createdAt,
      })
      .from(UsersTable)
      .where(and(...conditions));

    // Get commission stats for each Jyotishi
    const jyotishisWithStats = await Promise.all(
      jyotishis.map(async (jyotishi) => {
        const [stats] = await db
          .select({
            totalCommission: sql<number>`COALESCE(SUM(${CommissionsTable.commissionAmount}), 0)`,
            pendingCommission: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PENDING' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
            paidCommission: sql<number>`COALESCE(SUM(CASE WHEN ${CommissionsTable.status} = 'PAID' THEN ${CommissionsTable.commissionAmount} ELSE 0 END), 0)`,
            totalSales: sql<number>`COUNT(*)`,
          })
          .from(CommissionsTable)
          .where(eq(CommissionsTable.jyotishiId, jyotishi.id));

        return {
          ...jyotishi,
          stats: {
            totalCommission: Number(stats.totalCommission),
            pendingCommission: Number(stats.pendingCommission),
            paidCommission: Number(stats.paidCommission),
            totalSales: Number(stats.totalSales),
          },
        };
      })
    );

    return NextResponse.json(
      { jyotishis: jyotishisWithStats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jyotishis:", error);
    return NextResponse.json(
      { error: "Failed to fetch jyotishis" },
      { status: 500 }
    );
  }
}

// POST - Create Jyotishi account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      mobile,
      jyotishiCode,
      commissionRate,
      bankAccountNumber,
      bankIfscCode,
      bankAccountHolderName,
      panNumber,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !jyotishiCode || !commissionRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if Jyotishi code already exists
    const [existingCode] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.jyotishiCode, jyotishiCode))
      .limit(1);

    if (existingCode) {
      return NextResponse.json(
        { error: "Jyotishi code already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Jyotishi account
    const [jyotishi] = await db
      .insert(UsersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        mobile,
        role: "JYOTISHI",
        jyotishiCode,
        commissionRate,
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
        panNumber,
        isActive: true,
        updatedAt: new Date(),
      })
      .returning();

    // Remove password from response
    const { password: _, ...jyotishiData } = jyotishi;

    return NextResponse.json(
      {
        message: "Jyotishi account created successfully",
        jyotishi: jyotishiData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating jyotishi:", error);
    return NextResponse.json(
      { error: "Failed to create jyotishi account" },
      { status: 500 }
    );
  }
}