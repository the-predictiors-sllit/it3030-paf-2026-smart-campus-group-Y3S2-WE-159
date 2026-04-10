import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { UserRole, extractRolesFromToken, canPerformAction } from '@/lib/roles';

/**
 * Middleware to verify authentication and extract roles from Auth0 token
 */
export async function withAuth(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return {
        authenticated: false,
        user: null,
        roles: [],
        token: null,
      };
    }

    const { token } = await auth0.getAccessToken();
    const roles = extractRolesFromToken(token);

    return {
      authenticated: true,
      user: session.user,
      roles,
      token,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      authenticated: false,
      user: null,
      roles: [],
      token: null,
    };
  }
}

/**
 * Middleware to require authentication
 * Use in API routes that require logged-in users
 */
export async function requireAuth(request: NextRequest) {
  const auth = await withAuth(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unauthorized',
        details: 'You must be logged in to access this resource',
      },
      { status: 401 }
    );
  }

  return auth;
}

/**
 * Middleware to require specific role
 * Use in API routes that require a specific role
 */
export async function requireRole(request: NextRequest, requiredRole: UserRole) {
  const auth = await requireAuth(request);

  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!canPerformAction(auth.roles, requiredRole)) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Forbidden',
        details: `This resource requires ${requiredRole} role or higher`,
      },
      { status: 403 }
    );
  }

  return auth;
}

/**
 * Middleware to require any of several roles
 */
export async function requireAnyRole(request: NextRequest, requiredRoles: UserRole[]) {
  const auth = await requireAuth(request);

  if (auth instanceof NextResponse) {
    return auth;
  }

  const hasRequiredRole = requiredRoles.some(role =>
    canPerformAction(auth.roles, role)
  );

  if (!hasRequiredRole) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Forbidden',
        details: `This resource requires one of: ${requiredRoles.join(', ')}`,
      },
      { status: 403 }
    );
  }

  return auth;
}
