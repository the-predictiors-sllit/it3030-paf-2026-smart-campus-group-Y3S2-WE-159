import { getBaseUrl } from '@/lib/api-client';
import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { token } = await auth0.getAccessToken();
    const apiUrl = getBaseUrl();

    // Fetch all tickets for aggregation
    const backendRes = await fetch(`${apiUrl}/api/tickets?limit=1000`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Failed to fetch tickets' },
        { status: backendRes.status }
      );
    }

    const ticketData = await backendRes.json();
    const tickets = ticketData.data?.items || [];

    // Aggregate analytics
    const statusDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    const createdDates: Record<string, number> = {};

    let resolvedCount = 0;
    let openCount = 0;
    let inProgressCount = 0;
    let rejectedCount = 0;

    for (const ticket of tickets) {
      // Status
      statusDistribution[ticket.status] = (statusDistribution[ticket.status] || 0) + 1;
      
      if (ticket.status === 'OPEN') openCount++;
      if (ticket.status === 'IN_PROGRESS') inProgressCount++;
      if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') resolvedCount++;
      if (ticket.status === 'REJECTED') rejectedCount++;

      // Category
      categoryDistribution[ticket.category] = (categoryDistribution[ticket.category] || 0) + 1;

      // Priority
      priorityDistribution[ticket.priority] = (priorityDistribution[ticket.priority] || 0) + 1;

      // Count tickets created in last 7 days
      const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      createdDates[createdDate] = (createdDates[createdDate] || 0) + 1;
    }

    // Build last 7 days trend
    const trends: Array<[string, number]> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trends.push([dateStr, createdDates[dateStr] || 0]);
    }

    const analytics = {
      totalTickets: tickets.length,
      openTickets: openCount,
      inProgressTickets: inProgressCount,
      resolvedTickets: resolvedCount,
      rejectedTickets: rejectedCount,
      resolutionRate: tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0,
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => [status, count]),
      categoryDistribution: Object.entries(categoryDistribution).map(([category, count]) => [category, count]),
      priorityDistribution: Object.entries(priorityDistribution).map(([priority, count]) => [priority, count]),
      trends,
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
