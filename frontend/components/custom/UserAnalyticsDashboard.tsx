"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Users, ShieldCheck, UserPlus, Activity, TrendingUp } from "lucide-react"

interface Auth0User {
  user_id: string
  email_verified?: boolean
  created_at?: string
  last_login?: string
  app_metadata?: { roles?: string[] }
  user_metadata?: { roles?: string[] }
  role?: string | string[]
  identities?: Array<{ connection?: string }>
}

const parseUserRoles = (user: Auth0User) => {
  const roleSource =
    user.app_metadata?.roles ?? user.user_metadata?.roles ?? user.role

  if (Array.isArray(roleSource) && roleSource.length > 0) {
    return roleSource.map((role) => String(role).trim()).filter(Boolean)
  }

  if (typeof roleSource === "string" && roleSource.trim().length > 0) {
    return roleSource
      .split(/[;,]/)
      .map((part) => part.trim())
      .filter(Boolean)
  }

  const identity = user.identities?.[0]?.connection
  if (identity) return [identity]

  return ["Unassigned"]
}

const getLast7Days = () => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(today)
    next.setDate(today.getDate() - (6 - index))
    return next
  })
}

const normalizeDateKey = (date: Date) => date.toISOString().slice(0, 10)

const CHART_COLORS = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--destructive)", "var(--muted)"]

export const UserAnalyticsDashboard = () => {
  const [users, setUsers] = useState<Auth0User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/auth0/management/users?page=0&per_page=100", {
          cache: "no-store",
          credentials: "same-origin",
        })
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json?.message || "Failed to fetch users")
        }

        const list = Array.isArray(json) ? json : Array.isArray(json?.data?.items) ? json.data.items : []
        setUsers(list as Auth0User[])
      } catch (err) {
        setError("Unable to load user analytics.")
        console.error(err)
        toast.error("Failed to load user analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const last7Days = useMemo(() => getLast7Days(), [])

  const emailVerifiedCount = useMemo(
    () => users.filter((user) => user.email_verified).length,
    [users]
  )

  const activeCount = useMemo(() => {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 30)
    return users.filter((user) => user.last_login && new Date(user.last_login) >= threshold).length
  }, [users])

  const newThisWeek = useMemo(() => {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 7)
    return users.filter((user) => user.created_at && new Date(user.created_at) >= threshold).length
  }, [users])

  const roleDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    users.forEach((user) => {
      const roles = parseUserRoles(user)
      roles.forEach((role) => counts.set(role, (counts.get(role) || 0) + 1))
    })
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [users])

  const registrationTrend = useMemo(() => {
    const counts = new Map<string, number>()
    users.forEach((user) => {
      if (!user.created_at) return
      const dayKey = user.created_at.slice(0, 10)
      counts.set(dayKey, (counts.get(dayKey) || 0) + 1)
    })

    return last7Days.map((date) => ({
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: counts.get(normalizeDateKey(date)) ?? 0,
    }))
  }, [users, last7Days])

  const verificationData = useMemo(
    () => [
      { name: "Verified", value: emailVerifiedCount },
      { name: "Unverified", value: users.length - emailVerifiedCount },
    ],
    [emailVerifiedCount, users.length]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">Loading users from Auth0...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total users",
            value: users.length,
            subtitle: "All active Auth0 accounts",
            icon: Users,
          },
          {
            title: "Verified emails",
            value: emailVerifiedCount,
            subtitle: "Secure signups",
            icon: ShieldCheck,
          },
          {
            title: "New registrations",
            value: newThisWeek,
            subtitle: "Last 7 days",
            icon: UserPlus,
          },
          {
            title: "Active in 30d",
            value: activeCount,
            subtitle: "Recent login activity",
            icon: Activity,
          },
        ].map(({ title, value, subtitle, icon: Icon }, index) => (
          <Card key={index} className="border border-border/50 bg-card p-6 shadow-sm">
            <CardHeader className="flex items-start justify-between gap-4 p-0 pb-4">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{subtitle}</CardDescription>
              </div>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-0">
              <p className="mt-4 text-3xl font-semibold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Registration trend</CardTitle>
            <CardDescription>New users over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrend} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: 10 }} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--secondary)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Email verification</CardTitle>
            <CardDescription>Verified accounts vs unverified</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ name }) => name}
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Role distribution</CardTitle>
          <CardDescription>Most common roles and account categories</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ name }) => name}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`role-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {roleDistribution.slice(0, 6).map((role) => (
              <div key={role.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.round((role.value / Math.max(users.length, 1)) * 100)}% of users</p>
                </div>
                <Badge variant="secondary">{role.value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
