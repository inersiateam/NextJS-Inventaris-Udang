import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  };
}

function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";

  // if (pathname === "/api/auth/callback/credentials" || pathname === "/login") {
  //   const loginLimit = rateLimit(`login:${ip}`, 5, 5 * 60 * 1000);

  //   if (!loginLimit.allowed) {
  //     const response = NextResponse.json(
  //       { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
  //       { status: 429 }
  //     );
  //     response.headers.set("X-RateLimit-Limit", "5");
  //     response.headers.set("X-RateLimit-Remaining", "0");
  //     response.headers.set(
  //       "X-RateLimit-Reset",
  //       loginLimit.resetTime.toString()
  //     );
  //     return setSecurityHeaders(response);
  //   }
  // }

  // if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
  //   const apiLimit = rateLimit(`api:${ip}`, 100, 60 * 1000);

  //   if (!apiLimit.allowed) {
  //     const response = NextResponse.json(
  //       { error: "Rate limit exceeded" },
  //       { status: 429 }
  //     );
  //     response.headers.set("X-RateLimit-Limit", "100");
  //     response.headers.set("X-RateLimit-Remaining", "0");
  //     response.headers.set("X-RateLimit-Reset", apiLimit.resetTime.toString());
  //     return setSecurityHeaders(response);
  //   }

  //   const headers = new Headers(request.headers);
  //   headers.set("X-RateLimit-Remaining", apiLimit.remaining.toString());
  // }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicRoute = pathname === "/login" || pathname === "/";

  const isAdminRoute =
    pathname.startsWith("/(admin)") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/barang-masuk") ||
    pathname.startsWith("/barang-keluar") ||
    pathname.startsWith("/pelanggan") ||
    pathname.startsWith("/pengeluaran") ||
    pathname.startsWith("/laporan") ||
    pathname.startsWith("/profile");

  const isProtectedApiRoute =
    pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

  if (!token && (isAdminRoute || isProtectedApiRoute)) {
    if (isProtectedApiRoute) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return setSecurityHeaders(response);
    }
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    return setSecurityHeaders(response);
  }

  if (token && pathname === "/login") {
    const dashboardUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(dashboardUrl);
    return setSecurityHeaders(response);
  }

  if (token && pathname === "/") {
    const dashboardUrl = new URL("/dashboard", request.url);
    const response = NextResponse.redirect(dashboardUrl);
    return setSecurityHeaders(response);
  }

  if (token && !isPublicRoute) {
    if (token.isActive === false) {
      const loginUrl = new URL("/login?error=inactive", request.url);
      const response = NextResponse.redirect(loginUrl);
      return setSecurityHeaders(response);
    }
  }

  const response = NextResponse.next();
  if (token?.jabatan) {
    response.headers.set("x-user-jabatan", token.jabatan as string);
    response.headers.set("x-user-id", token.sub || "");
    response.headers.set("x-user-username", (token.username as string) || "");
  }

  return setSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
