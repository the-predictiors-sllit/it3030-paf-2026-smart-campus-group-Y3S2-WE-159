"use client"
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EmptyData } from './EmptyData'
import { LoadingData } from './LoadingData'
import MarkdownPreview from './MarkdownPreview'
import { TicketAttachmentView } from './TicketAttachmentView'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { Calendar, MapPin, AlertCircle, User, Clock } from 'lucide-react'


interface Link {
    href: string
    method?: string | null
}

interface ApiLinks {
    comments: Link
    self: Link
    update: Link
    add_comment: Link
    delete: Link
}
interface TicketComment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
}
interface ticketData {
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
    authorId: string;
    attachments: string[] | null
    comments: TicketComment[]
    createdAt: string
    updatedAt: string
}
interface ApiResponseProps {
    data: ticketData
    _links: ApiLinks
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

export const TicketPreview = ({ ticketId }: { ticketId: string }) => {
    const [ticket, setTicket] = useState<ticketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
                    method: 'GET',
                })

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                const result: ApiResponseProps = await response.json();

                if (result.status === "success") {
                    setTicket(result.data);
                }
            } catch (error) {
                toast.warning("Something went wrong!")
                console.error("Failed to fetch resource:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [ticketId]);

    if (loading) return <div><LoadingData /></div>;
    if (!ticket) return <div><EmptyData /></div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {ticket.resource?.name || "No Resource"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ticket ID: {ticket.id}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
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
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-card/50">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs font-medium">Location</span>
                            </div>
                            <p className="font-semibold text-sm">{ticket.location}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-muted-foreground block">Category</span>
                            <p className="font-semibold text-sm">{ticket.category}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-medium">Created</span>
                            </div>
                            <p className="font-semibold text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-xs font-medium">Assigned</span>
                            </div>
                            <p className="font-semibold text-sm">{ticket.assignedTo || "Unassigned"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Description Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Description
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <MarkdownPreview content={ticket.description || ""} />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Contact Phone</p>
                            <p className="font-mono">{ticket.contactPhone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Created By</p>
                            <p>{ticket.createdBy}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resolution Notes Section (if exists) */}
            {ticket.resolutionNotes && (
                <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="text-green-700 dark:text-green-400">Resolution Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <MarkdownPreview content={ticket.resolutionNotes} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attachments</CardTitle>
                        <CardDescription>
                            {ticket.attachments.length} file{ticket.attachments.length !== 1 ? 's' : ''} attached
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TicketAttachmentView images={ticket.attachments} />
                    </CardContent>
                </Card>
            )}

            {/* Metadata Footer */}
            <Card className="bg-card/50 border-dashed">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                            <p className="font-medium mb-1">Last Updated</p>
                            <p>{new Date(ticket.updatedAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">Comments</p>
                            <p>{ticket.comments?.length || 0} comment{(ticket.comments?.length || 0) !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
