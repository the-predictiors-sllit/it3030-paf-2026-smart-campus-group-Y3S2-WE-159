import { UserAnalyticsDashboard } from '@/components/custom/UserAnalyticsDashboard'

const page = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <section className="w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">User analytics</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review Auth0 user account health, registration trends, and role distribution.
          </p>
        </div>

        <UserAnalyticsDashboard />
      </section>
    </div>
  )
}

export default page