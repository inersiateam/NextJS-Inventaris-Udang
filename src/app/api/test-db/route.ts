import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const adminCount = await prisma.admin.count();

    return NextResponse.json({
      success: true,
      message: "Database connected!",
      data: {
        adminCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
