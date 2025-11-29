import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/api");
  
  // Check if the route is public
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for accessToken cookie
  const accessToken = request.cookies.get("accessToken");
  
  // If no accessToken and trying to access protected route, redirect to /auth
  if (!accessToken) {
    const authUrl = new URL("/auth", request.url);
    // Preserve the original path as a query parameter for redirect after login
    authUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(authUrl);
  }
  
  // User has accessToken, allow access
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

