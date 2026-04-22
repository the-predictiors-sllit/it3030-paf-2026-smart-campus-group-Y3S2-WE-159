"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
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
} from "recharts"
import {
    Building2Icon,
    FlaskConical,
    Cpu,
    CheckCircle,
    AlertCircle,
    Plus,
    ArrowRight,
    TrendingUp,
} from "lucide-react"

interface ResourceAnalytics {
    totalResources: number
    typeDistribution: Record<string, number>
    statusDistribution: Record<string, number>
    mostBookedResources: Array<{ name: string; bookingCount: number }>
    recentlyAdded: Array<{
        id: string
        name: string
        type: string
        status: string
        createdAt: string
    }>
    avgCapacityByType: Array<{ type: string; avgCapacity: number }>
    activeResources: number
    inactiveResources: number
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case "ROOM":
            return <Building2Icon className="h-6 w-6" />
        case "LAB":
            return <FlaskConical className="h-6 w-6" />
        case "EQUIPMENT":
            return <Cpu className="h-6 w-6" />
        default:
            return <Building2Icon className="h-6 w-6" />
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "ROOM":
            return "#3b82f6"
        case "LAB":
            return "#a855f7"
        case "EQUIPMENT":
            return "#f59e0b"
        default:
            return "#6b7280"
    }
}

const COLORS = ["#3b82f6", "#a855f7", "#f59e0b"]

export const ResourceAnalyticsDashboard = () => {
    const router = useRouter()
    const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true)
                const response = await fetch("/api/analytics/resources")
                const result = await response.json()

                if (result.totalResources !== undefined) {
                    setAnalytics(result)
                } else {
                    toast.error("Failed to load analytics")
                }
            } catch (error) {
                console.error("Error fetching analytics:", error)
                toast.error("Failed to load analytics")
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground text-lg">Failed to load analytics</p>
            </div>
        )
    }

    // Prepare data for charts
    const typeDistributionData = Object.entries(analytics.typeDistribution).map(
        ([type, count]) => ({
            name: type,
            value: count,
        })
    )

    const statusDistributionData = Object.entries(analytics.statusDistribution).map(
        ([status, count]) => ({
            name: status === "ACTIVE" ? "Active" : "Out of Service",
            value: count,
        })
    )

    const mostBookedData = analytics.mostBookedResources.slice(0, 5).map((item) => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
        bookings: item.bookingCount,
    }))

    const capacityData = analytics.avgCapacityByType.map((item) => ({
        type: item.type,
        capacity: Math.round(item.avgCapacity),
    }))

    return (
        <div className="w-full space-y-8 p-6 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">Resources Analytics</h1>
                    <p className="text-muted-foreground mt-2">Comprehensive overview of all campus resources</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/resources/addResources")}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Resource
                </Button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Resources */}
                <Card className="border border-border/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{analytics.totalResources}</p>
                            <p className="text-xs text-muted-foreground mt-1">Across all types</p>
                        </div>
                    </div>
                </Card>

                {/* Active Resources */}
                <Card className="border border-border/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Active Resources</p>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-emerald-600">{analytics.activeResources}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.totalResources > 0
                                    ? `${Math.round((analytics.activeResources / analytics.totalResources) * 100)}% utilization`
                                    : "0% utilization"}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Inactive Resources */}
                <Card className="border border-border/50 p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Out of Service</p>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-destructive">{analytics.inactiveResources}</p>
                            <p className="text-xs text-muted-foreground mt-1">Requiring maintenance</p>
                        </div>
                    </div>
                </Card>

                {/* Management Actions */}
                <Card className="border border-border/50 p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
                        <div className="space-y-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => router.push("/admin/resources/viewResources")}
                            >
                                <ArrowRight className="h-3 w-3" />
                                View All
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Distribution by Type */}
                <Card className="border border-border/50 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Resources by Type</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {typeDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Resource Distribution by Status */}
                <Card className="border border-border/50 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Status Overview</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Most Booked Resources */}
            {mostBookedData.length > 0 && (
                <Card className="border border-border/50 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Most Booked Resources</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mostBookedData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            )}

            {/* Average Capacity by Type */}
            {capacityData.length > 0 && (
                <Card className="border border-border/50 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Average Capacity by Type</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={capacityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="capacity" fill="#a855f7" name="Avg Capacity (people)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            )}

            {/* Recently Added Resources */}
            {analytics.recentlyAdded.length > 0 && (
                <Card className="border border-border/50 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recently Added Resources</h3>
                        <div className="space-y-3">
                            {analytics.recentlyAdded.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/admin/resources/viewResources`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            {getTypeIcon(resource.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{resource.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(resource.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{resource.type}</Badge>
                                        <Badge
                                            className={
                                                resource.status === "ACTIVE"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-red-100 text-red-800"
                                            }
                                        >
                                            {resource.status === "ACTIVE" ? "Active" : "Out of Service"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
