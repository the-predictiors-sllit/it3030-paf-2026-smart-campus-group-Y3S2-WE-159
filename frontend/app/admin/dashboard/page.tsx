'use client';

/**
 * Admin Dashboard Page (Client-Side Protection)
 * For pages that need role-based guards with graceful fallback UI
 */

import { AdminOnly } from '@/components/auth/RoleGuards';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboard() {
  const { loading, error, name, roles } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Error: {error}
        </div>
      )}

      <AdminOnly 
        fallback={
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="font-semibold text-amber-900 mb-2">Admin Access Required</h2>
            <p className="text-amber-800">
              This page requires administrator privileges. 
              Your current role is: <strong>{roles.join(', ')}</strong>
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin panels here */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">User Management</h3>
            <p className="text-sm text-blue-800 mt-2">Manage system users and permissions</p>
          </div>
          
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900">System Settings</h3>
            <p className="text-sm text-green-800 mt-2">Configure system-wide settings</p>
          </div>
          
          <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900">Reports</h3>
            <p className="text-sm text-purple-800 mt-2">View system analytics and reports</p>
          </div>
        </div>
      </AdminOnly>
    </>
  );
}
