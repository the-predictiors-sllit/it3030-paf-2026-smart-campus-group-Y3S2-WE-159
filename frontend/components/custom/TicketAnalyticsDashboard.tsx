"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts"

interface TicketAnalytics {
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

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subtext?: string
  className?: string
}

const StatCard = ({ icon, label, value, subtext, className }: StatCardProps) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
        <div className="text-muted-foreground opacity-50">{icon}</div>
      </div>
    </CardContent>
  </Card>
)

export const TicketAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/analytics/tickets")
        if (!response.ok) throw new Error("Failed to fetch analytics")

        const data: TicketAnalytics = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast.error("Failed to load ticket analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center w-full">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading ticket analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-screen items-center justify-center w-full">
        <Card className="p-8">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </Card>
      </div>
    )
  }

  // Format data for charts
  const statusData = analytics.statusDistribution.map(([status, count]) => ({
    name: status,
    value: count,
  }))

  const categoryData = analytics.categoryDistribution.map(([category, count]) => ({
    name: category,
    count,
  }))

  const priorityData = analytics.priorityDistribution.map(([priority, count]) => ({
    name: priority,
    count,
  }))

  const trendData = analytics.trends.map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    count,
  }))

  // Colors for charts
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]

  const statusColors: Record<string, string> = {
    OPEN: "#eab308", // yellow
    IN_PROGRESS: "#3b82f6", // blue
    RESOLVED: "#10b981", // green
    CLOSED: "#6b7280", // gray
    REJECTED: "#ef4444", // red
  }

  return (
    <div className="w-full space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Ticket Analytics
        </h1>
        <p className="text-muted-foreground">
          Performance metrics and insights about incident ticket management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Total Tickets"
          value={analytics.totalTickets}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Open"
          value={analytics.openTickets}
          subtext="Awaiting Action"
          className="border-yellow-200 dark:border-yellow-900"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="In Progress"
          value={analytics.inProgressTickets}
          subtext="Being Resolved"
          className="border-blue-200 dark:border-blue-900"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Resolved"
          value={analytics.resolvedTickets}
          subtext={`${analytics.resolutionRate}% Resolution Rate`}
          className="border-green-200 dark:border-green-900"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Rejected"
          value={analytics.rejectedTickets}
          subtext="Declined or Invalid"
          className="border-red-200 dark:border-red-900"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of tickets by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.name] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Tickets grouped by incident category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>By Priority</CardTitle>
            <CardDescription>Distribution of tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend (Last 7 Days) */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Trend</CardTitle>
            <CardDescription>New tickets created over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{analytics.totalTickets}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{analytics.resolutionRate}%</p>
                {analytics.resolutionRate >= 70 && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Excellent</Badge>
                )}
                {analytics.resolutionRate >= 50 && analytics.resolutionRate < 70 && (
                  <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Good</Badge>
                )}
                {analytics.resolutionRate < 50 && (
                  <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">Needs Improvement</Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Resolution</p>
              <p className="text-2xl font-bold">
                {analytics.openTickets + analytics.inProgressTickets}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
