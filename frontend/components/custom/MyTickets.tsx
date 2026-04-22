"use client"
import { Search, X } from "lucide-react"
import { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { EmptyData } from './EmptyData'
import { LoadingData } from './LoadingData'
import { Separator } from '../ui/separator'


interface ResourceSummary {
  id: string;
  name: string;
}
interface Link {
  href: string;
}
interface TicketLinks {
  comments: Link;
  self: Link;
}

interface TicketResponseData {
  id: string;
  resource: ResourceSummary | null;
  location: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _links: TicketLinks;
}

interface ApiResponseProps {
  data: {
    items: TicketResponseData[];
  };
  status: string;
  error: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  RESOLVED: { label: "Resolved", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  CLOSED: { label: "Closed", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
  REJECTED: { label: "Rejected", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  MEDIUM: { label: "Medium", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  HIGH: { label: "High", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  CRITICAL: { label: "Critical", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
}

export const MyTickets = () => {
  const [tickets, setTickets] = useState<TicketResponseData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketResponseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tickets/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const result: ApiResponseProps = await response.json();
        if (result.status === "success") {
          setTickets(result.data.items);
          setFilteredTickets(result.data.items);
        }

      } catch (error) {
        toast.warning("Something went wrong!")
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = tickets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        (ticket.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        ticket.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  if (loading) return <div><LoadingData /></div>;

  const hasFilters = searchTerm || statusFilter || priorityFilter;

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your support tickets
        </p>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card">
        <div>
          <h2 className="font-semibold mb-3">Filters & Search</h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by resource name, location, category, or ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                {statusConfig[statusFilter]?.label}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {priorityFilter && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                {priorityConfig[priorityFilter]?.label}
                <button
                  onClick={() => setPriorityFilter("")}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>

        {filteredTickets.length === 0 ? (
          <EmptyData />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:border-primary/50 hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <CardTitle className="line-clamp-2 cursor-pointer hover:text-primary transition-colors">
                        {ticket.resource?.name || "No Resource"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        ID: {ticket.id}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={statusConfig[ticket.status]?.className}
                      >
                        {statusConfig[ticket.status]?.label || ticket.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={priorityConfig[ticket.priority]?.className}
                      >
                        {priorityConfig[ticket.priority]?.label || ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Location</p>
                      <p className="font-medium">{ticket.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Category</p>
                      <p className="font-medium">{ticket.category}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Created</p>
                      <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/tickets/myticket/${ticket.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => ticket.resource && router.push(`/resources/${ticket.resource.id}`)}
                      disabled={!ticket.resource}>
                      Resource
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
