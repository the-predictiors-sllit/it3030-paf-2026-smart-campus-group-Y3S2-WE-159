/**
 * Role-based access control utilities
 * Handles role extraction, validation, and type-safe role checking
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER',
}

export type UserRoleString = 'ADMIN' | 'TECHNICIAN' | 'USER';

/**
 * Extract roles from Auth0 access token claims
 * Auth0 custom claim namespace: https://smartcampus.api/roles
 */
export function extractRolesFromToken(token: string): UserRole[] {
  try {
    // Decode JWT (basic decode without verification - verification happens on backend)
    const parts = token.split('.');
    if (parts.length !== 3) return [UserRole.USER];

    const decoded = JSON.parse(atob(parts[1]));
    const namespace = 'https://smartcampus.api';
    const rolesFromToken = decoded[`${namespace}/roles`];

    if (!rolesFromToken) return [UserRole.USER];

    // Ensure roles is an array
    const roleArray = Array.isArray(rolesFromToken) ? rolesFromToken : [rolesFromToken];

    // Filter to valid roles
    return roleArray.filter((role: string): role is UserRole =>
      Object.values(UserRole).includes(role as UserRole)
    );
  } catch (error) {
    console.error('Failed to extract roles from token:', error);
    return [UserRole.USER];
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(roles: UserRole[], requiredRole: UserRole): boolean {
  return roles.includes(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(roles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => roles.includes(role));
}

/**
 * Check if user has all required roles
 */
export function hasAllRoles(roles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.every(role => roles.includes(role));
}

/**
 * Get role priority (higher = more privileged)
 */
export function getRolePriority(role: UserRole): number {
  const priorities: Record<UserRole, number> = {
    [UserRole.ADMIN]: 3,
    [UserRole.TECHNICIAN]: 2,
    [UserRole.USER]: 1,
  };
  return priorities[role];
}

/**
 * Check if a role can perform an action (simple hierarchy)
 * ADMIN > TECHNICIAN > USER
 */
export function canPerformAction(
  userRoles: UserRole[],
  requiredRole: UserRole
): boolean {
  const userPriority = Math.max(
    ...userRoles.map(getRolePriority),
    0
  );
  const requiredPriority = getRolePriority(requiredRole);
  return userPriority >= requiredPriority;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.TECHNICIAN]: 'Technician',
    [UserRole.USER]: 'User',
  };
  return displayNames[role];
}
