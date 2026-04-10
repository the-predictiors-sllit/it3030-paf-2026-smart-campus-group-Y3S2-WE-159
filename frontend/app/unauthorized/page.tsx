export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-6 mb-8 shadow-sm">
          <p className="text-gray-700 mb-4">
            You don't have permission to access this page. Your current access level may not be sufficient for this resource.
          </p>
          <p className="text-sm text-gray-600">
            If you believe you should have access, please contact your administrator.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Dashboard
          </a>
          <a
            href="/user/profile"
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            View Profile
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you continue to see this error, try logging out and logging back in.
        </p>
      </div>
    </div>
  );
}
