'use client';

import React, { ReactNode } from 'react';
import { UserRole, hasRole, hasAnyRole, hasAllRoles } from '@/lib/roles';
import { useAuth } from '@/lib/auth-context';

/**
 * ProtectByRole Component
 * Shows content only if user has the required role
 */
interface ProtectByRoleProps {
  requiredRole: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectByRole = ({
  requiredRole,
  children,
  fallback = <AccessDenied />,
}: ProtectByRoleProps) => {
  const { roles, loading } = useAuth();

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (!hasRole(roles, requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * ProtectByAnyRole Component
 * Shows content if user has any of the required roles
 */
interface ProtectByAnyRoleProps {
  requiredRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectByAnyRole = ({
  requiredRoles,
  children,
  fallback = <AccessDenied />,
}: ProtectByAnyRoleProps) => {
  const { roles, loading } = useAuth();

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (!hasAnyRole(roles, requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * ProtectByAllRoles Component
 * Shows content only if user has all required roles
 */
interface ProtectByAllRolesProps {
  requiredRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectByAllRoles = ({
  requiredRoles,
  children,
  fallback = <AccessDenied />,
}: ProtectByAllRolesProps) => {
  const { roles, loading } = useAuth();

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (!hasAllRoles(roles, requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * HideFromRole Component
 * Hides content from users with a specific role
 */
interface HideFromRoleProps {
  hiddenRole: UserRole;
  children: ReactNode;
}

export const HideFromRole = ({ hiddenRole, children }: HideFromRoleProps) => {
  const { roles, loading } = useAuth();

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (hasRole(roles, hiddenRole)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Default fallback component for access denied
 */
const AccessDenied = () => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
    <p className="text-sm font-medium">Access Denied</p>
    <p className="text-xs text-red-700 mt-1">
      You don't have permission to view this content.
    </p>
  </div>
);

/**
 * Loading placeholder
 */
const LoadingPlaceholder = () => (
  <div className="animate-pulse rounded-lg bg-gray-200 h-20" />
);

/**
 * Portal component for administrative sections
 * Requires ADMIN role
 */
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <ProtectByRole requiredRole={UserRole.ADMIN} fallback={fallback}>
    {children}
  </ProtectByRole>
);

/**
 * Portal component for technician and admin
 * Requires TECHNICIAN or higher role
 */
export const TechnicianOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <ProtectByAnyRole
    requiredRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}
    fallback={fallback}
  >
    {children}
  </ProtectByAnyRole>
);

/**
 * Component visible to all authenticated users
 */
export const UserOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <ProtectByRole requiredRole={UserRole.USER} fallback={fallback}>
    {children}
  </ProtectByRole>
);
