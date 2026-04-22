
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminTicketRow } from "@/components/custom/AdminTickets/AdminTicketRow"
import { toast } from "sonner"
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  Ticket,
} from "lucide-react"

interface TicketData {
  id: string
  resource: {
    id: string
    name: string
  } | null
  location: string
  category: string
  priority: string
  status: string
  description: string
  contactPhone: string
  createdBy: string
  assignedTo: string | null
  resolutionNotes: string | null
  createdAt: string
  updatedAt: string
  attachments?: string[] | null
  comments?: any[]
}

interface ApiResponse {
  status: string
  data: {
    items: TicketData[]
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "SOFTWARE", label: "Software" },
  { value: "NETWORK", label: "Network" },
  { value: "FACILITY", label: "Facility" },
  { value: "OTHER", label: "Other" },
]

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
]

interface ViewTicketsPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

const ViewTicketsPage = ({ searchParams }: ViewTicketsPageProps) => {
  const [selectedTab, setSelectedTab] = useState<"open" | "closed">("open")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [page, setPage] = useState(1)

  const [openTickets, setOpenTickets] = useState<TicketData[]>([])
  const [closedTickets, setClosedTickets] = useState<TicketData[]>([])
  const [loadingOpen, setLoadingOpen] = useState(false)
  const [loadingClosed, setLoadingClosed] = useState(false)

  const [totalOpenPages, setTotalOpenPages] = useState(0)
  const [totalClosedPages, setTotalClosedPages] = useState(0)

  const LIMIT = 10

  const fetchTickets = useCallback(
    async (status: "OPEN" | "CLOSED", pageNum: number = 1) => {
      const isOpen = status === "OPEN"
      const setLoading = isOpen ? setLoadingOpen : setLoadingClosed

      setLoading(true)
      try {
        let url = `/api/tickets?status=${status}&page=${pageNum}&limit=${LIMIT}`

        if (searchQuery) {
          // Note: backend might not support search in query, so we filter client-side
          url += `&search=${encodeURIComponent(searchQuery)}`
        }
        if (selectedCategory !== "all") {
          url += `&category=${selectedCategory}`
        }
        if (selectedPriority !== "all") {
          url += `&priority=${selectedPriority}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch tickets")

        const data: ApiResponse = await response.json()
        if (data.status === "success") {
          const tickets = data.data.items

          // Client-side filtering ensures filters still work even if backend ignores query params.
          const normalizedSearch = searchQuery.trim().toLowerCase()
          const filtered = tickets.filter((t) => {
            const matchesSearch =
              !normalizedSearch ||
              (t.id?.toLowerCase().includes(normalizedSearch) ?? false) ||
              (t.resource?.name?.toLowerCase().includes(normalizedSearch) ?? false) ||
              (t.description?.toLowerCase().includes(normalizedSearch) ?? false)

            const matchesCategory =
              selectedCategory === "all" || t.category === selectedCategory

            const matchesPriority =
              selectedPriority === "all" || t.priority === selectedPriority

            return matchesSearch && matchesCategory && matchesPriority
          })

          if (isOpen) {
            setOpenTickets(filtered)
            setTotalOpenPages(data.data.totalPages)
          } else {
            setClosedTickets(filtered)
            setTotalClosedPages(data.data.totalPages)
          }
        }
      } catch (error) {
        toast.error("Failed to load tickets")
        console.error("Error fetching tickets:", error)
      } finally {
        setLoading(false)
      }
    },
    [searchQuery, selectedCategory, selectedPriority]
  )

  // Fetch when tab or filters change
  useEffect(() => {
    setPage(1)
    const status = selectedTab === "open" ? "OPEN" : "CLOSED"
    fetchTickets(status, 1)
  }, [selectedTab, selectedCategory, selectedPriority, fetchTickets])

  // Fetch when search query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      const status = selectedTab === "open" ? "OPEN" : "CLOSED"
      fetchTickets(status, 1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedTab, fetchTickets])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const status = selectedTab === "open" ? "OPEN" : "CLOSED"
    fetchTickets(status, newPage)
  }

  const currentTickets = selectedTab === "open" ? openTickets : closedTickets
  const isLoading = selectedTab === "open" ? loadingOpen : loadingClosed
  const totalPages = selectedTab === "open" ? totalOpenPages : totalClosedPages

  return (
    <main className="min-h-screen w-full">
      <div className="container  mx-auto py-8 px-4">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            Manage Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage all incident tickets, view details, and track resolution progress
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6 border-border/50">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticket ID, resource, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((pri) => (
                      <SelectItem key={pri.value} value={pri.value}>
                        {pri.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || selectedCategory !== "all" || selectedPriority !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedPriority("all")
                }}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "open" | "closed")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="open" className="gap-2 flex items-center">
              <AlertCircle className="h-4 w-4" />
              <span>
                Open Tickets
                {!loadingOpen && openTickets.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                    {openTickets.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="closed" className="gap-2 flex items-center">
              <CheckCircle className="h-4 w-4" />
              <span>
                Closed Tickets
                {!loadingClosed && closedTickets.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-semibold">
                    {closedTickets.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* OPEN TICKETS */}
          <TabsContent value="open" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-32" />
                  </Card>
                ))}
              </div>
            ) : currentTickets.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {currentTickets.map((ticket) => (
                    <AdminTicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onSelect={() => {}}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 border-dashed text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">All Clear!</p>
                <p className="text-muted-foreground mt-2">
                  No open tickets to display. Your team is caught up! 🎉
                </p>
              </Card>
            )}
          </TabsContent>

          {/* CLOSED TICKETS */}
          <TabsContent value="closed" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-32" />
                  </Card>
                ))}
              </div>
            ) : currentTickets.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {currentTickets.map((ticket) => (
                    <AdminTicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onSelect={() => {}}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 border-dashed text-center">
                <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Closed Tickets</p>
                <p className="text-muted-foreground mt-2">
                  Closed tickets will appear here once tickets are resolved or rejected.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default ViewTicketsPage