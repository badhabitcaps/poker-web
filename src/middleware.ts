import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes under /hand except for viewing
export const config = {
  matcher: [
    "/hand/new",
    "/hand/:id/edit",
    "/profile",
    "/settings",
    "/api/hands/:path*",
    "/api/comments/:path*",
    "/api/votes/:path*",
    "/api/save/:path*",
  ],
}; 