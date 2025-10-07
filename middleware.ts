import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Kalau tidak ada token (belum login) -> redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, 
    },
  }
);


// semua route yang perlu proteksi
export const config = {
  matcher: [
    "/(admin)/:path*", // lindungi semua halaman di dalam folder (admin)
  ],
};
