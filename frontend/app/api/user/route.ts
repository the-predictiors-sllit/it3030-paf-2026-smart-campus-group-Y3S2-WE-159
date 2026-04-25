import { getBaseUrl, SERVER_API_URL } from "@/lib/api-client";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

type BackendProfileResponse = {
  status: "success";
  data: {
    id: number | string;
    name: string;
    email: string;
    role: string;
    picture?: string | null;
    auth0UserId?: string | null;
    auth0Name?: string | null;
    auth0Email?: string | null;
  };
};

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    let registerWarning: { status: number; details: string } | null = null;
    let auth0Profile: Record<string, unknown> | null = null;

    const Api_Url = getBaseUrl();
    // register user
    const registerRes = await fetch(`${Api_Url}/api/auth/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!registerRes.ok) {
      const body = await registerRes.text();
      registerWarning = {
        status: registerRes.status,
        details: body || registerRes.statusText,
      };
    }

    // fetch backend profile
    const profileRes = await fetch(`${SERVER_API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!profileRes.ok) {
      const body = await profileRes.text();
      return NextResponse.json(
        {
          status: "error",
          message: "Backend profile fetch failed",
          details: body || profileRes.statusText,
        },
        { status: profileRes.status }

      );
    }
    const profile: BackendProfileResponse = await profileRes.json();

    // Enrich with latest Auth0 management profile (picture, display name, etc.)
    if (session.user.sub) {
      try {
        const managementRes = await fetch(
          `${Api_Url}/api/auth0/management/users/${encodeURIComponent(session.user.sub)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (managementRes.ok) {
          auth0Profile = await managementRes.json();
        }
      } catch {
        // Ignore management-profile errors and continue with session data fallback.
      }
    }

    const enrichedProfile: BackendProfileResponse = {
      ...profile,
      data: {
        ...profile.data,
        auth0UserId: session.user.sub ?? null,
        picture:
          (typeof auth0Profile?.picture === "string" && auth0Profile.picture) ||
          (typeof session.user.picture === "string" ? session.user.picture : null),
        auth0Name:
          (typeof auth0Profile?.name === "string" && auth0Profile.name) ||
          (typeof session.user.name === "string" ? session.user.name : null),
        auth0Email:
          (typeof auth0Profile?.email === "string" && auth0Profile.email) ||
          (typeof session.user.email === "string" ? session.user.email : null),
      },
    };

    if (registerWarning) {
      return NextResponse.json(
        {
          ...enrichedProfile,
          warning: {
            message: "Backend register failed, but profile was fetched",
            ...registerWarning,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(enrichedProfile, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

