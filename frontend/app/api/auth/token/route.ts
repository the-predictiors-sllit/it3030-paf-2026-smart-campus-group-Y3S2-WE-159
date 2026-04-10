import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

/**
 * GET /api/auth/token
 * 
 * Returns the current user's access token and basic auth info.
 * Used by the Auth context to populate token information on the client.
 * 
 * Security Note: 
 * - This endpoint only works for authenticated users
 * - The token is not stored in cookies/local storage (it's only used for API calls)
 * - Each request re-fetches the token from Auth0
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        token: auth.token,
        roles: auth.roles,
        user: {
          email: auth.user?.email,
          name: auth.user?.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve token';
    return NextResponse.json(
      {
        status: 'error',
        message,
      },
      { status: 500 }
    );
  }
}
