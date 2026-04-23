"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import MarkdownPreview from "@/components/custom/MarkdownPreview"
import { TicketAttachmentView } from "@/components/custom/TicketAttachmentView"
import { toast } from "sonner"
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  FileText,
  MapPin,
  ArrowLeft,
} from "lucide-react"
import dynamic from "next/dynamic"
import { CommentCard } from "@/components/custom/commentCard"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
})

interface TicketData {
  id: string
  resource: {
    id: string
    name: string
    location?: string | null
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

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "Open",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
}

const priorityConfig: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  LOW: { label: "Low", className: "bg-muted text-foreground", icon: "📍" },
  MEDIUM: {
    label: "Medium",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    icon: "⚠️",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    icon: "🔥",
  },
  CRITICAL: {
    label: "Critical",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: "🚨",
  },
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const ticketId = decodeURIComponent(id)

  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [postingComment, setPostingComment] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  const ticketLocation =
    ticket?.location || ticket?.resource?.location || "Location not available"
  const ticketDescription = ticket?.description || "No description provided"

  // Fetch ticket details
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user")
        if (!response.ok) return

        const userData = await response.json()
        const userId = userData?.data?.id
        if (userId !== undefined && userId !== null) {
          setCurrentUserId(String(userId))
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    const fetchTicket = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/tickets/${encodeURIComponent(ticketId)}`
        )
        if (!response.ok) throw new Error("Failed to fetch ticket")

        const data = await response.json()
        if (data.status === "success") {
          setTicket(data.data)
          setNewStatus(data.data.status)
          setResolutionNotes(data.data.resolutionNotes || "")
          fetchComments(data.data.id)
        }
      } catch (error) {
        console.error("Error fetching ticket:", error)
        toast.error("Failed to load ticket details")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
    fetchTicket()
  }, [ticketId])

  const fetchComments = async (id: string) => {
    try {
      setLoadingComments(true)
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(id)}/comments`
      )
      if (!response.ok) throw new Error("Failed to fetch comments")

      const data = await response.json()
      if (data.status === "success") {
        setComments(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return

    const trimmedResolutionNotes = resolutionNotes.trim()
    const requiresResolutionNotes = ["RESOLVED", "CLOSED", "REJECTED"].includes(
      newStatus
    )

    if (requiresResolutionNotes && !trimmedResolutionNotes) {
      toast.error(
        "Resolution notes are required before moving a ticket to this status"
      )
      return
    }

    setUpdatingStatus(true)
    try {
      const payload: Record<string, string> = {
        status: newStatus,
      }

      if (currentUserId) {
        payload.assignedTo = currentUserId
      }

      if (trimmedResolutionNotes) {
        payload.resolutionNotes = trimmedResolutionNotes
      }

      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to update ticket status"

        try {
          const parsedError = JSON.parse(errorText)
          errorMessage =
            parsedError?.error?.message ||
            parsedError?.message ||
            errorText ||
            errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (data.status === "success") {
        toast.success("Ticket status updated successfully!")
        setTicket(data.data)
        setResolutionNotes(data.data.resolutionNotes || "")
      }
    } catch (error) {
      toast.error("Failed to update ticket status")
      console.error("Error updating ticket:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return

    setPostingComment(true)
    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newComment }),
        }
      )

      if (!response.ok) throw new Error("Failed to post comment")

      const data = await response.json()
      if (data.status === "success") {
        setComments([...comments, data.data])
        setNewComment("")
        toast.success("Comment posted!")
      }
    } catch (error) {
      toast.error("Failed to post comment")
      console.error("Error posting comment:", error)
    } finally {
      setPostingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Ticket not found</p>
        </Card>
      </div>
    )
  }

  const statusOption = statusConfig[ticket.status] || statusConfig.OPEN
  const priorityOption = priorityConfig[ticket.priority] || priorityConfig.LOW

  return (
    <main className="min-h-screen w-full">
      <div className="w-full space-y-8 p-6">
        {/* Header with Back Button */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  {ticket.resource?.name || "No Resource"}
                </h1>
                <p className="text-muted-foreground">Ticket ID: {ticket.id}</p>
              </div>
              <div className="flex gap-2 flex-nowrap">
                <Badge variant="outline" className={statusOption.className}>
                  {statusOption.label}
                </Badge>
                <Badge variant="outline" className={priorityOption.className}>
                  {priorityOption.icon} {priorityOption.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">
              Images ({ticket.attachments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {ticket.resource?.name || "No Resource"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p className="text-base">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="text-base">{ticketLocation}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Contact Phone
                    </p>
                    <p className="text-base">{ticket.contactPhone}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="h-4 w-4" />
                      Reported By
                    </p>
                    <p className="text-base">{ticket.createdBy}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Description
                  </p>
                  <div className="rounded-md bg-muted p-3">
                    <MarkdownPreview content={ticketDescription} />
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Resolution Notes
                    </p>
                    <div className="rounded-md border border-border/50 bg-muted p-3">
                      <MarkdownPreview content={ticket.resolutionNotes} />
                    </div>
                  </div>
                )}

                <div className="space-y-1 border-t border-border/30 pt-2 text-xs text-muted-foreground">
                  <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMAGES TAB */}
          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketAttachmentView images={ticket.attachments || null} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMENTS TAB */}
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Discussion Thread</CardTitle>
                <CardDescription>{comments.length} comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Comment</label>
                  <Card>
                    <CardContent>
                      <MDEditor
                        value={newComment}
                        onChange={(val) => setNewComment(val || "")}
                        height={200}
                        preview="edit"
                        hideToolbar={false}
                        visibleDragbar={false}
                        textareaProps={{ disabled: postingComment }}
                        style={{
                          backgroundColor: "var(--color-card)",
                        }}
                        previewOptions={{
                          style: { backgroundColor: "transparent" },
                        }}
                      />
                    </CardContent>
                  </Card>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || postingComment}
                    size="sm"
                  >
                    {postingComment && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Post Comment
                  </Button>
                </div>

                <div className="border-t border-border/30 pt-4">
                  {loadingComments ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Loading comments...
                    </p>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentCard
                          key={comment.id}
                          userName={
                            comment.authorName ||
                            comment.userName ||
                            comment.authorId ||
                            "Anonymous"
                          }
                          comment={comment.text || comment.comment || ""}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No comments yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANAGE TAB */}
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Ticket</CardTitle>
                <CardDescription>
                  Modify ticket status and resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Resolution Notes (Markdown)
                  </label>
                  <Card>
                    <CardContent>
                      <MDEditor
                        value={resolutionNotes}
                        onChange={(val) => setResolutionNotes(val || "")}
                        height={300}
                        preview="edit"
                        hideToolbar={false}
                        visibleDragbar={false}
                        style={{
                          backgroundColor: "var(--color-card)",
                        }}
                        previewOptions={{
                          style: { backgroundColor: "transparent" },
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus}
                  size="lg"
                  className="w-full"
                >
                  {updatingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Ticket Status
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
