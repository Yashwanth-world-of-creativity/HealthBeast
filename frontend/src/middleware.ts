import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // If clear parameter is present, clear the cookie and allow the request
  if (request.nextUrl.searchParams.get("clear") === "1") {
    const response = NextResponse.next();
    response.cookies.set("session_token", "", { path: "/", maxAge: 0 });
    return response;
  }

  const token = request.cookies.get("session_token")?.value;

  const protectedPaths = [
    "/dashboard",
    "/ai-assistant",
    "/symptoms",
    "/reports",
    "/medications",
    "/recovery",
    "/hydration",
    "/analytics",
    "/settings",
    "/onboarding"
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  const isAuthPage = ["/login", "/register"].some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access a protected page without a session token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access auth pages while already logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/ai-assistant",
    "/ai-assistant/:path*",
    "/symptoms",
    "/symptoms/:path*",
    "/reports",
    "/reports/:path*",
    "/medications",
    "/medications/:path*",
    "/recovery",
    "/recovery/:path*",
    "/hydration",
    "/hydration/:path*",
    "/analytics",
    "/analytics/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
    "/register"
  ]
};
