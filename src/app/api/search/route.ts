// File: app/api/search/route.ts
// Pastikan struktur folder: app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { globalSearch } from "@/lib/services/globalSearchService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    const jabatan = session.user.jabatan;

    const results = await globalSearch(query, jabatan, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
        results: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// Tambahkan dynamic route config jika diperlukan
export const dynamic = 'force-dynamic';