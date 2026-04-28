"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  Building2Icon,
  Calendar,
  Ticket,
  Users,
} from "lucide-react"

interface BookingSummaryResponse {
  peakHours: [number, number][]
  resources: [string, number][]
  statusDistribution: [string, number][]
  trends: [string, number][]
}

interface ResourceAnalyticsResponse {
  totalResources: number
  activeResources: number
  inactiveResources: number
  typeDistribution: Record<string, number>
  statusDistribution: Record<string, number>
  mostBookedResources: Array<{ name: string; bookingCount: number }>
  avgCapacityByType: Array<{ type: string; avgCapacity: number }>
}

interface TicketAnalyticsResponse {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  rejectedTickets: number
  resolutionRate: number
  statusDistribution: Array<[string, number]>
  categoryDistribution: Array<[string, number]>
  priorityDistribution: Array<[string, number]>
  trends: Array<[string, number]>
}

interface Auth0User {
  user_id: string
  email?: string
  email_verified?: boolean
  created_at?: string
  last_login?: string
  app_metadata?: { roles?: string[] }
  user_metadata?: { roles?: string[] }
  role?: string | string[]
  identities?: Array<{ connection?: string }>
}

const adminCards = [
  {
    title: "Bookings",
    description: "Track request velocity, approvals, and peak usage windows.",
    href: "/admin/booking",
    icon: Calendar,
    bg: "bg-primary/10",
    text: "text-primary",
  },
  {
    title: "Resources",
    description: "Inspect inventory, utilization, and resource status trends.",
    href: "/admin/resources",
    icon: Building2Icon,
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  {
    title: "Tickets",
    description: "Resolve issues and keep support response time in check.",
    href: "/admin/tickets",
    icon: Ticket,
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
  {
    title: "Users",
    description: "Review account health, signups, and role composition.",
    href: "/admin/users",
    icon: Users,
    bg: "bg-accent/10",
    text: "text-accent",
  },
]

const getLast7Days = () => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(today)
    next.setDate(today.getDate() - (6 - index))
    return next
  })
}

const normalizeToDay = (value: Date) => value.toISOString().slice(0, 10)

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

const chartColors = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--destructive)", "var(--muted)"]

export const AdminDashboardOverview = () => {
  const [bookingData, setBookingData] = useState<BookingSummaryResponse | null>(null)
  const [resourceData, setResourceData] = useState<ResourceAnalyticsResponse | null>(null)
  const [ticketData, setTicketData] = useState<TicketAnalyticsResponse | null>(null)
  const [users, setUsers] = useState<Auth0User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJson = async <T,>(url: string) => {
      const response = await fetch(url, { credentials: "same-origin", cache: "no-store" })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.message || `Failed to fetch ${url}`)
      }
      return json as T
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [bookingResult, resourceResult, ticketResult, userResult] =
          await Promise.allSettled([
            fetchJson<BookingSummaryResponse>("/api/analytics/bookings/summary"),
            fetchJson<ResourceAnalyticsResponse>("/api/analytics/resources"),
            fetchJson<TicketAnalyticsResponse>("/api/analytics/tickets"),
            fetchJson<unknown>("/api/auth0/management/users?page=0&per_page=100"),
          ])

        if (bookingResult.status === "fulfilled") {
          setBookingData(bookingResult.value)
        }

        if (resourceResult.status === "fulfilled") {
          setResourceData(resourceResult.value)
        }

        if (ticketResult.status === "fulfilled") {
          setTicketData(ticketResult.value)
        }

        if (userResult.status === "fulfilled") {
          const rawUsers = userResult.value
          const list = Array.isArray(rawUsers)
            ? rawUsers
            : Array.isArray((rawUsers as any)?.data?.items)
            ? (rawUsers as any).data.items
            : []
          setUsers(list as Auth0User[])
        }

        const failed = [bookingResult, resourceResult, ticketResult, userResult].filter(
          (item) => item.status === "rejected"
        )
        if (failed.length > 0) {
          setError("Some analytics failed to load. Refresh to try again.")
        }
      } catch (err) {
        setError("Unable to load dashboard analytics.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const last7Days = useMemo(() => getLast7Days(), [])

  const bookingTrendData = useMemo(
    () =>
      bookingData?.trends.map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        count,
      })) ?? [],
    [bookingData]
  )

  const resourceTypeData = useMemo(
    () =>
      Object.entries(resourceData?.typeDistribution ?? {}).map(([name, value]) => ({
        name,
        value,
      })),
    [resourceData]
  )

  const ticketStatusData = useMemo(
    () =>
      ticketData?.statusDistribution.map(([name, value]) => ({ name, value })) ?? [],
    [ticketData]
  )

  const registrationTrendData = useMemo(() => {
    if (!users.length) return []

    const counts = new Map<string, number>()
    users.forEach((user) => {
      const createdAt = user.created_at
      if (!createdAt) return
      const day = createdAt.slice(0, 10)
      counts.set(day, (counts.get(day) || 0) + 1)
    })

    return last7Days.map((date) => {
      const day = normalizeToDay(date)
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: counts.get(day) ?? 0,
      }
    })
  }, [last7Days, users])

  const roleDistributionData = useMemo(() => {
    if (!users.length) return []

    const counts = new Map<string, number>()
    users.forEach((user) => {
      const roles = parseUserRoles(user)
      roles.forEach((role) => counts.set(role, (counts.get(role) || 0) + 1))
    })

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [users])

  const totalBookings = bookingData?.statusDistribution?.reduce((acc, [, value]) => acc + value, 0) ?? 0
  const activeResources = resourceData?.activeResources ?? 0
  const openTickets = ticketData?.openTickets ?? 0
  const totalUsers = users.length

  const userActive30Days = users.filter((user) => {
    if (!user.last_login) return false
    const login = new Date(user.last_login)
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 30)
    return login >= threshold
  }).length

  const userVerified = users.filter((user) => user.email_verified).length

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Booking requests",
            value: totalBookings,
            detail: "Last 7 days of activity",
            icon: Calendar,
            tint: "text-primary",
          },
          {
            title: "Active resources",
            value: activeResources,
            detail: "Across campus inventory",
            icon: Building2Icon,
            tint: "text-secondary",
          },
          {
            title: "Open tickets",
            value: openTickets,
            detail: "Pending support",
            icon: Ticket,
            tint: "text-destructive",
          },
          {
            title: "Total users",
            value: totalUsers,
            detail: "Verified / active in 30d",
            icon: Users,
            tint: "text-accent",
          },
        ].map(({ title, value, detail, icon: Icon, tint }, index) => (
          <Card key={index} className="border border-border/50 bg-card p-6 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 p-0 pb-4">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{detail}</CardDescription>
              </div>
              <div className={`rounded-2xl bg-muted/30 p-3 ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <p className="mt-4 text-3xl font-semibold text-foreground">{value}</p>
              {title === "Total users" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {userVerified}/{totalUsers} verified · {userActive30Days} active
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="rounded-3xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Booking Velocity</CardTitle>
            <CardDescription>Daily request volume for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: 10 }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--secondary)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Resources by type</CardTitle>
            <CardDescription>Distribution of campus inventory</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={44}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {resourceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>User registrations</CardTitle>
            <CardDescription>New accounts created in the last week</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrendData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: 10 }} />
                <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={3} dot={{ fill: "var(--primary)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>User role mix</CardTitle>
            <CardDescription>Role distribution from Auth0 user data</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={44}
                  paddingAngle={4}
                  label={({ name }) => name}
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Administration quick actions</h2>
            <p className="text-sm text-muted-foreground">Jump directly into the most important admin workflows.</p>
          </div>
          <Button asChild variant="secondary" className="min-w-[10rem]">
            <Link href="/admin/booking">Review latest analytics</Link>
          </Button>
        </div>

        <BentoGrid className="lg:grid-rows-1">
          {adminCards.map(({ title, description, href, icon: Icon, bg, text }, index) => (
            <BentoCard
              key={title}
              name={title}
              description={description}
              href={href}
              cta="Open"
              Icon={Icon}
              background={<div className={`absolute inset-0 ${bg}`} />}
              className={"lg:col-span-1"}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  )
}
