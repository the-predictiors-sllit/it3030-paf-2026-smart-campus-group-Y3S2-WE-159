"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarClockIcon, MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"
import { EmptyData } from "./EmptyData"
import { LoadingData } from "./LoadingData"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Link {
  href: string
}
export interface BookingLinks {
  resource: Link
  self: Link
  resource_availability: Link
}
export interface ResourceSummary {
  id: string
  name: string
}
export interface BookingResponseData {
  id: string
  resource: ResourceSummary
  startTime: string
  endTime: string
  status: string
  _links: BookingLinks
}
interface ApiResponseProps {
  data: { items: BookingResponseData[] }
  status: string
  error: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "default"
    case "PENDING":
      return "secondary"
    case "REJECTED":
      return "destructive"
    case "CANCELLED":
      return "outline"
    default:
      return "secondary"
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingResponseData[]>([])
  const [filtered, setFiltered] = useState<BookingResponseData[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Inside export const MyBookings = () => { ...

  const handleCancel = async (bookingId: string) => {
    // Confirmation ensures accidental clicks don't trigger the backend
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "CANCELLED", 
          reason: "User cancelled request" 
        }),
      });

      if (response.ok) {
        toast.success("Booking cancelled");
      
        // Real-time state update prevents unnecessary page reloads
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        ));
      } else {
        toast.error("Unable to cancel booking at this time.");
      }
    } catch (error) {
      toast.error("Connection error. Check your network.");
    }
    };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/bookings/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        const result: ApiResponseProps = await response.json()
        if (result.status === "success") {
          setBookings(result.data.items)
          setFiltered(result.data.items)
        }
      } catch (error) {
        toast.warning("Something went wrong!")
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter whenever search or statusFilter changes
  useEffect(() => {
    let result = bookings
    if (statusFilter !== "ALL")
      result = result.filter((b) => b.status === statusFilter)
    if (search.trim())
      result = result.filter((b) =>
        b.resource.name.toLowerCase().includes(search.toLowerCase())
      )
    setFiltered(result)
  }, [search, statusFilter, bookings])

  if (loading) return <LoadingData />
  if (!loading && bookings.length === 0) return <EmptyData />

  const statuses = [
    "ALL",
    ...Array.from(new Set(bookings.map((b) => b.status))),
  ]

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          My bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your space reservations.
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-[11px] h-[14px] w-[14px] -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by resource…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-[34px]"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-[6px]">
          {statuses.map((s) => (
            <Button
              key={s}
              onClick={() => setStatusFilter(s)}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="rounded-full min-w-15 text-xs p-2"
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <Card className="relative overflow-hidden p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <CalendarClockIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              No bookings match your filter
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or status filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking, idx) => {
                const start = formatDateTime(booking.startTime)
                const end = formatDateTime(booking.endTime)
                return (
                  <TableRow key={booking.id}>
                    {/* Resource */}
                    <TableCell>
                      <button
                        onClick={() =>
                          router.push(`/resources/${booking.resource.id}`)
                        }
                        className="text-sm font-medium text-foreground underline decoration-muted-foreground underline-offset-2 transition hover:translate-x-0.5 hover:decoration-foreground"
                      >
                        {booking.resource.name}
                      </button>
                    </TableCell>

                    {/* Start */}
                    <TableCell>
                      <p className="text-sm text-foreground">{start.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {start.time}
                      </p>
                    </TableCell>

                    {/* End */}
                    <TableCell>
                      <p className="text-sm text-foreground">{end.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {end.time}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)} >
                        {booking.status == "PENDING" && <Spinner />}
                        
                        {booking.status.charAt(0) +
                          booking.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {booking.status === "PENDING" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10"
                            onClick={() => handleCancel(booking.id)}
                            >
                              Cancel booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Footer count ── */}
      <p className="mt-4 text-right text-xs text-muted-foreground">
        {filtered.length} of {bookings.length} booking
        {bookings.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
