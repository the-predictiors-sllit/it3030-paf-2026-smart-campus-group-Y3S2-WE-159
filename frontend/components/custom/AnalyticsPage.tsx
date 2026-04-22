"use client";

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    LineChart, 
    Line, 
    CartesianGrid,
    Legend
} from 'recharts';
import { toast } from "sonner";
import { Loader2, TrendingUp, Users, Calendar, CheckCircle2 } from "lucide-react";

type ApiTupleStringNumber = [string, number];
type ApiTupleNumberNumber = [number, number];

interface AnalyticsApiResponse {
    peakHours: ApiTupleNumberNumber[];
    resources: ApiTupleStringNumber[];
    statusDistribution: ApiTupleStringNumber[];
    trends: ApiTupleStringNumber[];
}

interface AnalyticsViewData {
    resources: { name: string; count: number }[];
    status: { name: string; value: number }[];
    trends: { date: string; count: number }[];
    metrics: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        busiestHour: string;
    };
}

// Theme-compatible color palette using your CSS variables
const CHART_COLORS = [
    'var(--primary)',
    'var(--secondary)',
    'var(--accent)',
    'var(--muted)',
    'var(--destructive)',
];

export const AnalyticsPage = ({token}:{token:string}) => {
    const [data, setData] = useState<AnalyticsViewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const endpoint = '/api/analytics/bookings/summary';
                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to synchronize analytics");
                const json: AnalyticsApiResponse = await res.json();

                const today = new Date();
                const last7Days = Array.from({ length: 7 }, (_, idx) => {
                    const d = new Date(today);
                    d.setDate(today.getDate() - (6 - idx));
                    return d;
                });

                const trendMap = new Map(
                    (json.trends || []).map(([date, count]) => [date, count])
                );

                const normalizedTrends = last7Days.map((dateObj) => {
                    const isoDate = dateObj.toISOString().slice(0, 10);
                    return {
                        date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                        count: trendMap.get(isoDate) || 0,
                    };
                });

                const statusMap = new Map((json.statusDistribution || []).map(([name, count]) => [name, count]));
                const peakHour = [...(json.peakHours || [])].sort((a, b) => b[1] - a[1])[0]?.[0];
                const formatHour = (hour?: number) => {
                    if (hour === undefined || hour === null) return 'N/A';
                    const suffix = hour >= 12 ? 'PM' : 'AM';
                    const normalized = hour % 12 === 0 ? 12 : hour % 12;
                    return `${normalized}:00 ${suffix}`;
                };
                
                // Transformation layer for Recharts format
                setData({
                    resources: (json.resources || []).map(([name, count]) => ({ name, count })),
                    status: (json.statusDistribution || []).map(([name, value]) => ({ name, value })),
                    trends: normalizedTrends,
                    metrics: {
                        total: (json.statusDistribution || []).reduce((acc, [, value]) => acc + value, 0),
                        approved: statusMap.get('APPROVED') || 0,
                        pending: statusMap.get('PENDING') || 0,
                        rejected: statusMap.get('REJECTED') || 0,
                        busiestHour: formatHour(peakHour),
                    }
                });
            } catch (err) {
                toast.error("Analytics synchronization failed");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse">Aggregating Campus Data...</p>
            </div>
        );
    }

    const hasAnyData = (data?.metrics.total || 0) > 0;

    return (
        <div className="h-full w-full space-y-6">
            {/* 1. Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="h-full w-full bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.metrics.total}</div>
                        <p className="text-xs text-muted-foreground">Total booking records captured</p>
                    </CardContent>
                </Card>
                <Card className="h-full w-full bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Approval Volume</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.metrics.approved}</div>
                        <p className="text-xs text-muted-foreground">Processed by Admin</p>
                    </CardContent>
                </Card>
                <Card className="h-full w-full bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.metrics.busiestHour}</div>
                        <p className="text-xs text-muted-foreground">Highest booking start volume</p>
                    </CardContent>
                </Card>
                <Card className="h-full w-full bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.metrics.pending}</div>
                        <p className="text-xs text-muted-foreground">Rejected: {data?.metrics.rejected}</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Charts Row */}
            {!hasAnyData ? (
                <Card className="h-full w-full bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">No data yet</CardTitle>
                        <CardDescription>
                            Booking analytics will appear here once requests are created and processed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-65 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground text-center">
                            Start by creating bookings to populate trends, status distribution, and resource popularity.
                        </p>
                    </CardContent>
                </Card>
            ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-7 auto-rows-fr">
                {/* Weekly Trends Line Chart */}
                <Card className="lg:col-span-4 bg-card border-border h-full w-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Booking Velocity</CardTitle>
                        <CardDescription>Daily request volume over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-70 pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="var(--muted-foreground)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="var(--muted-foreground)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--popover-foreground)', fontSize: '12px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="var(--primary)" 
                                    strokeWidth={3} 
                                    dot={{ fill: 'var(--secondary)', r: 4 }} 
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution Pie Chart */}
                <Card className="lg:col-span-3 bg-card border-border h-full w-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Approval Efficiency</CardTitle>
                        <CardDescription>Ratio of approved vs rejected requests</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-70">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data?.status} 
                                    innerRadius={70} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data?.status.map((_, index: number) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Popular Resources Bar Chart */}
                <Card className="lg:col-span-7 bg-card border-border h-full w-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Resource Popularity</CardTitle>
                        <CardDescription>Most frequently booked campus assets</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-65">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.resources}>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="var(--muted-foreground)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="var(--muted-foreground)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip cursor={{ fill: 'var(--secondary)', fillOpacity: 0.18 }} />
                                <Bar 
                                    dataKey="count" 
                                    fill="var(--accent)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            )}
        </div>
    );
};