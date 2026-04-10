/**
 * Page Protection Patterns for Next.js
 * 
 * Three approaches for protecting pages based on roles
 */

import { UserRole } from '@/lib/roles';
import { ReactNode } from 'react';

// ========== APPROACH 1: Server-Side Protection (Recommended) ==========

/**
 * Server Component - Redirect non-authorized users
 * This prevents them from even loading the page
 * 
 * Use this when you want strict protection and redirects
 */

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { extractRolesFromToken } from '@/lib/roles';

export async function protectPageWithServerCheck(
  requiredRole: UserRole
) {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // For page protection, you would typically verify on backend
  // But you can also extract from token as fallback
  try {
    const { token } = await auth0.getAccessToken();
    const roles = extractRolesFromToken(token);
    
    const hasAccess = roles.some(role => 
      role === requiredRole || 
      (requiredRole === UserRole.USER) // All authenticated users are at least USER
    );
    
    if (!hasAccess) {
      redirect('/unauthorized');
    }
  } catch (error) {
    console.error('Failed to verify access', error);
    redirect('/api/auth/login');
  }
}

/**
 * Example Server Component:
 * 
 * // app/admin/page.tsx
 * import { protectPageWithServerCheck } from '@/lib/page-protection';
 * import { UserRole } from '@/lib/roles';
 * 
 * export default async function AdminPage() {
 *   await protectPageWithServerCheck(UserRole.ADMIN);
 *   
 *   return <div>Admin Content</div>;
 * }
 */

// ========== APPROACH 2: Client-Side Protection with Guards ==========

/**
 * Client Component - Render guards with fallback UI
 * 
 * Use this when you want graceful fallback or loading states
 */

import { AdminOnly, TechnicianOnly, ProtectByRole } from '@/components/auth/RoleGuards';

/**
 * Example Client Component:
 * 
 * // app/dashboard/admin/page.tsx
 * "use client";
 * import { AdminOnly } from '@/components/auth/RoleGuards';
 * import { useAuth } from '@/lib/auth-context';
 * 
 * export default function AdminDashboard() {
 *   const { loading, error } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   return (
 *     <AdminOnly fallback={<AccessDenied />}>
 *       <div>Admin Dashboard</div>
 *     </AdminOnly>
 *   );
 * }
 */

// ========== APPROACH 3: API Route as Backend Validation ==========

/**
 * Server-Side: Validate role through backend API call
 * Then protect the page based on that
 * 
 * Most secure approach - backend validates all permissions
 */

export async function validateAccessViaBackend(requiredRole: UserRole) {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    return false;
  }

  try {
    const { token } = await auth0.getAccessToken();
    
    // Call your backend to validate role
    // This ensures backend has final say on permissions
    const response = await fetch('http://backend:8080/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return false;
    }

    const data: { role: string } = await response.json();
    return data.role === requiredRole || requiredRole === UserRole.USER;
  } catch (error) {
    console.error('Backend validation failed', error);
    return false;
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get role-based redirect destination based on user's role
 */
export function getRedirectBasedOnRole(role: UserRole): string {
  const redirects: Record<UserRole, string> = {
    [UserRole.ADMIN]: '/admin/dashboard',
    [UserRole.TECHNICIAN]: '/technician/dashboard',
    [UserRole.USER]: '/dashboard',
  };
  return redirects[role];
}
