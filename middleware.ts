import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the access token and user role from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // Allow login page access regardless of auth state
  // This lets users re-login with different credentials (e.g., admin switching to portal user)
  // The login page will clear old auth state before submitting
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // If accessing a dashboard or portal route without a token, redirect to login
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/portal")) &&
    !accessToken
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (accessToken && userRole) {
    // Portal routes: only VENDOR and CUSTOMER can access
    if (pathname.startsWith("/portal") && userRole !== "VENDOR" && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Dashboard routes: only ADMIN can access (VENDOR and CUSTOMER cannot)
    if (pathname.startsWith("/dashboard") && (userRole === "VENDOR" || userRole === "CUSTOMER")) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // If accessing register with a token, redirect based on role
  if (pathname === "/register" && accessToken) {
    if (userRole === "VENDOR" || userRole === "CUSTOMER") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
};
