'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, extractRolesFromToken, hasRole, hasAnyRole } from './roles';

export interface AuthContextType {
  // User identification
  userId: string | null;
  name: string | null;
  email: string | null;

  // Role information
  roles: UserRole[];
  primaryRole: UserRole | null;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Role checking methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserProfileData = {
  id: number | string;
  name: string;
  email: string;
  role: string;
};

interface ProfileResponse {
  status: "success";
  data: UserProfileData;
}

/**
 * Auth Provider Component
 * Fetches user profile and roles, provides them to the entire app
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([UserRole.USER]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUserProfile() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile and roles from backend API route
        const res = await fetch('/api/user', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Failed to load profile' }));
          throw new Error(err?.message || `Failed with status ${res.status}`);
        }

        const data: ProfileResponse = await res.json();

        if (active) {
          const profileData = data.data;
          setUserId(String(profileData.id));
          setName(profileData.name);
          setEmail(profileData.email);

          // Extract and set roles - first check the role from backend, then get from token
          // The backend should provide the role, but we can also extract from token if needed
          const userRoles = extractRolesToArray(profileData.role);
          setRoles(userRoles);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load user profile';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUserProfile();

    return () => {
      active = false;
    };
  }, []);

  const primaryRole = roles.length > 0 ? roles[0] : null;

  const value: AuthContextType = {
    userId,
    name,
    email,
    roles,
    primaryRole,
    loading,
    error,
    hasRole: (role: UserRole) => hasRole(roles, role),
    hasAnyRole: (requiredRoles: UserRole[]) => hasAnyRole(roles, requiredRoles),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 * Must be used in client components within AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Helper function to convert backend role string to array of UserRoles
 */
function extractRolesToArray(roleString: string | null): UserRole[] {
  if (!roleString) return [UserRole.USER];

  // Handle comma-separated roles (e.g., "ADMIN,TECHNICIAN")
  const roles = roleString.split(',').map(r => r.trim());

  // Filter to valid roles, default to USER
  const validRoles = roles.filter((role): role is UserRole =>
    Object.values(UserRole).includes(role as UserRole)
  );

  return validRoles.length > 0 ? validRoles : [UserRole.USER];
}
