import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { SERVER_API_URL } from "@/lib/api-client";

type BackendProfileResponse = {
  status: "success";
  data: {
    id: number | string;
    name: string;
    email: string;
    role: string;
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

    // register user
    const registerRes = await fetch(`${SERVER_API_URL}/api/auth/register`,
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

    if (registerWarning) {
      return NextResponse.json(
        {
          ...profile,
          warning: {
            message: "Backend register failed, but profile was fetched",
            ...registerWarning,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

