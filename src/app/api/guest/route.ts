import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("guest_session");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Guest logout error:", error);

    const response = NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
    
    response.cookies.delete("guest_session");

    return response;
  }
}
