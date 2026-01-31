import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the access token and user role from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

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
    // Portal routes: only PORTAL_USER can access
    if (pathname.startsWith("/portal") && userRole !== "PORTAL_USER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Dashboard routes: only ADMIN can access (PORTAL_USER cannot)
    if (pathname.startsWith("/dashboard") && userRole === "PORTAL_USER") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // If accessing login/register with a token, redirect based on role
  if ((pathname === "/login" || pathname === "/register") && accessToken) {
    if (userRole === "PORTAL_USER") {
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
