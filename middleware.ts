import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Jika belum login → redirect ke /login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Kalau sudah login → lanjut ke halaman yang diminta
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // hanya izinkan jika ada token
    },
  }
);

// Lindungi semua halaman dashboard & admin
export const config = {
  matcher: [ "/(admin)/:path*"],
};
