import { auth0 } from "@/lib/auth0";
import { NextResponse, type NextRequest } from "next/server";
import { SERVER_API_URL } from "./lib/api-client";

const PUBLIC_PATHS = ["/unauthorized"];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/api")) return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return auth0.middleware(request);
  }

  const session = await auth0.getSession(request);


  try {
    const { token } = await auth0.getAccessToken()
    console.log("getAccessToken " + token)
    // console.log( "getAccessToken " + expiresAt )

    // Keep backend user record in sync with Auth0 identity.
    await fetch(`${SERVER_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ""

    console.error("Failed to load backend profile: ", error)
  }



  if (!session || !session.user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const ADMIN_ONLY_PATHS = ["/admin", "/component"];
  const namespace = "https://smartcampus.api";
  const { user } = session;

  // Safe fallback to empty array if roles is missing
  const roles = (user[`${namespace}/roles`] as string[]) ?? [];
  console.log("roles:", roles);

  const isAdminPath = ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path));

  if (isAdminPath && !roles.includes("ADMIN")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};