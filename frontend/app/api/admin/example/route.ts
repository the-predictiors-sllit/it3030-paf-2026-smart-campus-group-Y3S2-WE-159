import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/roles';

/**
 * EXAMPLE: Protected API route that requires ADMIN role
 * 
 * This is a template for creating role-protected API endpoints.
 * Replace this with your actual admin endpoints.
 */

export async function GET(request: NextRequest) {
  // Require ADMIN role for this endpoint
  const auth = await requireRole(request, UserRole.ADMIN);

  // If auth is a NextResponse, it's an error response - return it
  if (auth instanceof NextResponse) {
    return auth;
  }

  // If we got here, user is authenticated and has ADMIN role
  try {
    // Your admin logic here
    return NextResponse.json(
      {
        status: 'success',
        message: 'This is an admin endpoint',
        user: {
          email: auth.user?.email,
          roles: auth.roles,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        status: 'error',
        message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Require ADMIN role for POST requests
  const auth = await requireRole(request, UserRole.ADMIN);

  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();

    // Your admin POST logic here
    return NextResponse.json(
      {
        status: 'success',
        message: 'Admin action completed',
        data: body,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        status: 'error',
        message,
      },
      { status: 500 }
    );
  }
}

/**
 * EXAMPLE: Protected route for TECHNICIAN or ADMIN
 * 
 * See /api/user/import for a real-world example
 */
export async function PUT(request: NextRequest) {
  // This would require Technician role or higher
  // const auth = await requireAnyRole(request, [UserRole.ADMIN, UserRole.TECHNICIAN]);
  
  // Implementation would go here
}

export async function DELETE(request: NextRequest) {
  // Only ADMIN can delete
  const auth = await requireRole(request, UserRole.ADMIN);

  if (auth instanceof NextResponse) {
    return auth;
  }

  // Implementation would go here
}
