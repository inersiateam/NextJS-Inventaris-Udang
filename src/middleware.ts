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

const guestSessionStore = new Map<
  string,
  { type: string; expiresAt: number }
>();

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of guestSessionStore.entries()) {
    if (now > session.expiresAt) {
      guestSessionStore.delete(sessionId);
    }
  }
}, 30 * 60 * 1000);

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

function generateGuestSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function validateGuestAccess(request: NextRequest, type: string): boolean {
  const guestSession = request.cookies.get("guest_session")?.value;

  if (guestSession) {
    const session = guestSessionStore.get(guestSession);
    if (session && session.type === type && Date.now() < session.expiresAt) {
      return true;
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/guest-selection";

  const isGuestRoute = pathname.startsWith("/laporan-guest");
  const isGuestApiRoute = pathname.startsWith("/api/guest");

  const isAdminRoute =
    pathname.startsWith("/(admin)") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/barang-masuk") ||
    pathname.startsWith("/barang-keluar") ||
    pathname.startsWith("/pelanggan") ||
    pathname.startsWith("/pengeluaran") ||
    (pathname.startsWith("/laporan") &&
      !pathname.startsWith("/laporan-guest")) ||
    pathname.startsWith("/profile");

  const isProtectedApiRoute =
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/guest");

  if (isGuestRoute) {
    const type = searchParams.get("type");

    if (!type || (type !== "abl" && type !== "atm")) {
      const selectionUrl = new URL("/guest-selection", request.url);
      const response = NextResponse.redirect(selectionUrl);
      return setSecurityHeaders(response);
    }

    const guestRateLimit = rateLimit(`guest:${ip}`, 50, 60 * 60 * 1000);
    if (!guestRateLimit.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      return setSecurityHeaders(response);
    }

    if (!validateGuestAccess(request, type)) {
      const selectionUrl = new URL("/guest-selection", request.url);
      const response = NextResponse.redirect(selectionUrl);
      return setSecurityHeaders(response);
    }

    const response = NextResponse.next();
    response.headers.set("x-guest-type", type);
    return setSecurityHeaders(response);
  }

  if (pathname === "/guest-selection") {
    const existingSession = request.cookies.get("guest_session")?.value;
    if (existingSession && guestSessionStore.has(existingSession)) {
      const session = guestSessionStore.get(existingSession);
      if (session && Date.now() < session.expiresAt) {
        const laporanUrl = new URL(
          `/laporan-guest?type=${session.type}`,
          request.url
        );
        const response = NextResponse.redirect(laporanUrl);
        return setSecurityHeaders(response);
      }
    }

    const guestCode = searchParams.get("code");

    if (guestCode) {
      let guestType: string | null = null;
      if (guestCode === "2503") {
        guestType = "abl";
      } else if (guestCode === "0125") {
        guestType = "atm";
      }

      if (guestType) {
        const sessionId = generateGuestSessionId();
        const expiresAt = Date.now() + 4 * 60 * 60 * 1000;

        guestSessionStore.set(sessionId, {
          type: guestType,
          expiresAt,
        });

        const laporanUrl = new URL(
          `/laporan-guest?type=${guestType}`,
          request.url
        );
        const response = NextResponse.redirect(laporanUrl);

        response.cookies.set("guest_session", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 4 * 60 * 60,
          path: "/",
        });

        return setSecurityHeaders(response);
      }
    }

    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

  if (pathname === "/api/guest/logout") {
    const guestSession = request.cookies.get("guest_session")?.value;

    if (guestSession && guestSessionStore.has(guestSession)) {
      guestSessionStore.delete(guestSession);
    }

    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

  if (isGuestApiRoute) {
    const guestSession = request.cookies.get("guest_session")?.value;

    if (!guestSession || !guestSessionStore.has(guestSession)) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return setSecurityHeaders(response);
    }

    const response = NextResponse.next();
    return setSecurityHeaders(response);
  }

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
