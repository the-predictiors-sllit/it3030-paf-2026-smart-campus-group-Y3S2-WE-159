import { auth0 } from '@/lib/auth0';
import { SERVER_API_URL } from '@/lib/api-client';
import { UserRole } from '@/lib/roles';
import { redirect } from 'next/navigation';

export async function requireAuthenticatedUser() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }
  return session.user;
}

export async function requireRole(requiredRole: UserRole) {
  await requireAuthenticatedUser();

  try {
    const { token } = await auth0.getAccessToken();
    const response = await fetch(`${SERVER_API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      redirect('/unauthorized');
    }

    const body: { data?: { role?: string } } = await response.json();
    const role = body?.data?.role;

    if (!role) {
      redirect('/unauthorized');
    }

    const hasAccess = role === requiredRole || requiredRole === UserRole.USER;

    if (!hasAccess) {
      redirect('/unauthorized');
    }
  } catch {
    redirect('/unauthorized');
  }
}
