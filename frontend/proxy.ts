import { auth0 } from "@/lib/auth0";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/unauthorized",
];

// Paths that Auth0 itself handles — never redirect these
const AUTH0_PATHS = [
  "/auth/login",
  "/auth/logout", 
  "/auth/callback",
  "/auth/profile",
];

function isPublicPath(pathname: string): boolean {
  // Always let Auth0's own routes through
  if (AUTH0_PATHS.some(p => pathname === p || pathname.startsWith(p))) return true;
  if (pathname.startsWith("/api")) return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let Auth0 handle its own routes without any interference
  if (isPublicPath(pathname)) {
    return auth0.middleware(request);
  }

  // For protected routes: run Auth0 middleware first, then check session
  const authResponse = await auth0.middleware(request);

  // Use Auth0's getSession() instead of manually checking cookies
  // This correctly handles chunked, prefixed, and encrypted session cookies
  try {
    const session = await auth0.getSession(request);

    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set(
        "returnTo",
        `${pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If session check throws, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};