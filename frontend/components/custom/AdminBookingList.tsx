"use client"

import * as React from "react"
import { EyeIcon, RefreshCwIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ResourceView } from "@/components/custom/ResourceView"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string

interface LinkValue {
  href: string
  method?: string
}

interface BookingListItem {
  id: string
  resource: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
  }
  startTime: string
  endTime: string
  status: BookingStatus
  _links: {
    resource?: LinkValue
    self?: LinkValue
    resource_availability?: LinkValue
  }
}

interface BookingDetails {
  id: string
  resourceId: string
  userId: string
  startTime: string
  endTime: string
  purpose: string | null
  expectedAttendees: number | null
  status: BookingStatus
  reason: string | null
  createdAt: string
  updatedAt: string
}

interface BookingListResponse {
  data: {
    items: BookingListItem[]
    total: number
    page: number
    totalPages: number
  }
  status: string
  error: { message?: string } | string | null
}

interface BookingDetailsResponse {
  data: BookingDetails
  status: string
  error: { message?: string } | string | null
}

const PAGE_SIZE = 10
const STATUS_OPTIONS: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"]

const formatDateTime = (iso: string) => {
  const value = new Date(iso)
  return value.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getStatusVariant = (status: BookingStatus): "default" | "secondary" | "destructive" | "outline" => {
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    const possible = (error as { message?: unknown }).message
    if (typeof possible === "string") return possible
  }
  return fallback
}

const toLocalApiPath = (href: string | undefined, fallback: string) => {
  if (!href) return fallback
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href)
      return url.pathname + url.search
    } catch {
      return fallback
    }
  }
  if (href.startsWith("/")) return href
  return fallback
}

export const AdminBookingList = () => {
  const [bookings, setBookings] = React.useState<BookingListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)

  const [selectedBooking, setSelectedBooking] = React.useState<BookingListItem | null>(null)

  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsLoading, setDetailsLoading] = React.useState(false)
  const [details, setDetails] = React.useState<BookingDetails | null>(null)

  const [statusOpen, setStatusOpen] = React.useState(false)
  const [nextStatus, setNextStatus] = React.useState<BookingStatus>("PENDING")
  const [statusReason, setStatusReason] = React.useState("")

  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const fetchBookings = React.useCallback(async (targetPage: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE),
      })
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/bookings?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const result: BookingListResponse = await response.json()

      if (!response.ok || result.status !== "success") {
        throw new Error(getErrorMessage(result.error, "Failed to fetch bookings"))
      }

      setBookings(result.data.items)
      setTotal(result.data.total)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load bookings"))
      setBookings([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  React.useEffect(() => {
    fetchBookings(1)
  }, [fetchBookings])

  const filteredBookings = React.useMemo(() => {
    if (!search.trim()) return bookings

    const query = search.toLowerCase()
    return bookings.filter((item) => {
      return (
        item.id.toLowerCase().includes(query) ||
        item.resource.name.toLowerCase().includes(query) ||
        item.resource.id.toLowerCase().includes(query) ||
        item.user.name.toLowerCase().includes(query) ||
        item.user.email.toLowerCase().includes(query)
      )
    })
  }, [bookings, search])

  const loadBookingDetails = async (booking: BookingListItem) => {
    setDetailsLoading(true)
    setDetails(null)
    try {
      const detailsPath = toLocalApiPath(booking._links?.self?.href, `/api/bookings/${booking.id}`)
      const response = await fetch(detailsPath, { method: "GET" })
      const result: BookingDetailsResponse = await response.json()

      if (!response.ok || result.status !== "success") {
        throw new Error(getErrorMessage(result.error, "Failed to load booking details"))
      }

      setDetails(result.data)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load booking details"))
    } finally {
      setDetailsLoading(false)
    }
  }

  const onOpenDetails = async (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
    await loadBookingDetails(booking)
  }

  const onOpenStatusDialog = (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setNextStatus(STATUS_OPTIONS.includes(booking.status) ? booking.status : "PENDING")
    setStatusReason("")
    setStatusOpen(true)
  }

  const onOpenDeleteDialog = (booking: BookingListItem) => {
    setSelectedBooking(booking)
    setDeleteOpen(true)
  }

  const onUpdateStatus = async () => {
    if (!selectedBooking) return

    setActionLoading(true)
    try {
      const basePath = toLocalApiPath(selectedBooking._links?.self?.href, `/api/bookings/${selectedBooking.id}`)
      const statusPath = `${basePath}/status`

      const response = await fetch(statusPath, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          reason: statusReason.trim() || null,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(getErrorMessage(result?.error, "Failed to update status"))
      }

      toast.success("Booking status updated")
      setStatusOpen(false)
      await fetchBookings(page)
      if (detailsOpen) {
        await loadBookingDetails(selectedBooking)
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update status"))
    } finally {
      setActionLoading(false)
    }
  }

  const onDeleteBooking = async () => {
    if (!selectedBooking) return

    setActionLoading(true)
    try {
      const deletePath = toLocalApiPath(selectedBooking._links?.self?.href, `/api/bookings/${selectedBooking.id}`)
      const response = await fetch(deletePath, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(getErrorMessage(result?.error, "Failed to delete booking"))
      }

      toast.success("Booking deleted")
      setDeleteOpen(false)

      // Keep pagination sane when the last item on a page is deleted.
      const nextPage = bookings.length === 1 && page > 1 ? page - 1 : page
      await fetchBookings(nextPage)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete booking"))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 w-full">
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Booking Management</h1>
            <p className="text-sm text-muted-foreground">
              Review, approve, reject, and remove resource bookings.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by booking, resource, or user"
              className="w-full md:w-72"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
              }}
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => fetchBookings(page)}
              disabled={loading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No bookings found for the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <p className="font-medium">{booking.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{booking.resource.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.resource.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDateTime(booking.startTime)}</p>
                      <p className="text-xs text-muted-foreground">to {formatDateTime(booking.endTime)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onOpenDetails(booking)}>
                          <EyeIcon className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => onOpenStatusDialog(booking)}>
                          Update
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onOpenDeleteDialog(booking)}>
                          <Trash2Icon className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground">
            Showing {filteredBookings.length} item(s) on page {page} of {totalPages}. Total records: {total}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => fetchBookings(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => fetchBookings(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} >
        <DialogContent className="max-h-[92vh] lg:max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Full booking details with linked resource preview.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading details...</div>
          ) : !details ? (
            <div className="py-10 text-center text-muted-foreground">Could not load booking details.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <Card className="overflow-hidden p-4">
                <h3 className="text-sm font-semibold">Resource Preview</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Original resource view embedded for admin verification.
                </p>
                <div className="max-h-[70vh] overflow-auto pr-1">
                  <ResourceView id={details.resourceId} />
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold">Booking Details</h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Booking metadata displayed as rows for long identifiers.
                </p>

                <div className="space-y-2">
                  {[
                    ["Booking ID", details.id],
                    ["User ID", details.userId],
                    ["Start", formatDateTime(details.startTime)],
                    ["End", formatDateTime(details.endTime)],
                    ["Purpose", details.purpose || "-"],
                    ["Expected Attendees", details.expectedAttendees !== null ? String(details.expectedAttendees) : "-"],
                    ["Status", details.status],
                    ["Reason", details.reason || "-"],
                    ["Resource ID", details.resourceId],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 border-b pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="break-words text-sm font-medium leading-6 text-foreground">
                        {label === "Status" ? (
                          <Badge variant={getStatusVariant(details.status)}>{value}</Badge>
                        ) : (
                          value
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <DialogFooter>
            {selectedBooking ? (
              <Button variant="outline" onClick={() => onOpenStatusDialog(selectedBooking)}>
                Update Status
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Approve, reject, or cancel this booking with an optional reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as BookingStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem value={status} key={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Reason</p>
              <Textarea
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
                placeholder="Optional message for this status update"
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onUpdateStatus} disabled={actionLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected booking will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDeleteBooking}>
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
