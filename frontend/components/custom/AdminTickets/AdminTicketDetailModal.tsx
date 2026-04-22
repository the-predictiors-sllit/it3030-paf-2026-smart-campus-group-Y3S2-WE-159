"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import MarkdownPreview from "../MarkdownPreview"
import { TicketImageGallery } from "./TicketImageGallery"
import { toast } from "sonner"
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, User, Phone, FileText } from "lucide-react"
import dynamic from "next/dynamic"
import { CommentCard } from "../commentCard"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
})

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

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]

interface AdminTicketDetailModalProps {
  ticket: TicketData | null
  isOpen: boolean
  onClose: () => void
  onTicketUpdated: (ticket: TicketData) => void
}

export const AdminTicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdated,
}: AdminTicketDetailModalProps) => {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [resolutionNotes, setResolutionNotes] = useState<string>("")
  const [newComment, setNewComment] = useState<string>("")
  const [postingComment, setPostingComment] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status)
      setResolutionNotes(ticket.resolutionNotes || "")
      fetchComments(ticket.id)
    }
  }, [ticket])

  const fetchComments = async (ticketId: string) => {
    setLoadingComments(true)
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/comments`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === "success") {
          setComments(data.data || [])
        }
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: resolutionNotes || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to update ticket status")

      const data = await response.json()
      if (data.status === "success") {
        toast.success("Ticket status updated successfully!")
        onTicketUpdated(data.data)
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

  if (!ticket) return null

  const statusOption = statusConfig[ticket.status] || statusConfig.OPEN
  const priorityOption = priorityConfig[ticket.priority] || priorityConfig.LOW

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-4xl lg:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl">{ticket.id}</DialogTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={statusOption.className}>
                {statusOption.label}
              </Badge>
              <Badge variant="outline" className={priorityOption.className}>
                {priorityOption.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images ({ticket.attachments?.length || 0})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{ticket.resource?.name || "No Resource"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-base">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base">{ticket.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Phone
                    </p>
                    <p className="text-base">{ticket.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Reported By
                    </p>
                    <p className="text-base">{ticket.createdBy}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <MarkdownPreview content={ticket.description} />
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Resolution Notes</p>
                    <div className="bg-muted p-3 rounded-md border border-border/50">
                      <MarkdownPreview content={ticket.resolutionNotes} />
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30">
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
                <TicketImageGallery attachments={ticket.attachments} ticketId={ticket.id} />
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
                  <MDEditor
                    value={newComment}
                    onChange={(val) => setNewComment(val || "")}
                    height={200}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragbar={false}
                    textareaProps={{ disabled: postingComment }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || postingComment}
                    size="sm"
                  >
                    {postingComment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Post Comment
                  </Button>
                </div>

                <div className="border-t border-border/30 pt-4">
                  {loadingComments ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
                  ) : comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <CommentCard
                          key={comment.id}
                          userName={comment.authorName || comment.authorId}
                          comment={comment.text}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANAGE TAB */}
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Ticket Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusConfig[status]?.label || status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resolution Notes</label>
                  <MDEditor
                    value={resolutionNotes}
                    onChange={(val) => setResolutionNotes(val || "")}
                    height={250}
                    preview="edit"
                    hideToolbar={false}
                    visibleDragbar={false}
                    textareaProps={{ disabled: updatingStatus }}
                  />
                </div>

                <div className="flex gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Updating the status will notify the ticket creator. Make sure all required information is filled.
                  </p>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === ticket.status}
                  className="w-full"
                  size="lg"
                >
                  {updatingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {newStatus === "RESOLVED" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </>
                  ) : newStatus === "REJECTED" ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Ticket
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
