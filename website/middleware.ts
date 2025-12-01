import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for accessToken cookie
  const accessToken = request.cookies.get("accessToken")?.value;

  // Check if user is trying to access auth routes (excluding success page)
  const isAuthRoute =
    pathname.startsWith("/auth") && !pathname.startsWith("/auth/success");

  // If user has a token and is trying to access auth routes, redirect to home
  // Note: Full token validation happens client-side via /api/auth/status
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/success");

  // If accessing auth routes without token, allow it
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Check if the route is public
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no accessToken and trying to access protected route, redirect to /auth
  if (!accessToken) {
    const authUrl = new URL("/auth", request.url);
    // Preserve the original path as a query parameter for redirect after login
    authUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(authUrl);
  }

  // User has accessToken, allow access (token validity checked client-side)
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
