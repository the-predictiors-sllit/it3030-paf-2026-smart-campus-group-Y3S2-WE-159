"use client"
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EmptyData } from './EmptyData'
import { LoadingData } from './LoadingData'
import MarkdownPreview from './MarkdownPreview'
import { TicketAttachmentView } from './TicketAttachmentView'


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
    }
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
export const TicketPreview = ({ ticketId }: { ticketId: string }) => {
    const [ticket, setTicket] = useState<ticketData | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchData = async () => {
            // const token = "token"

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

    if (loading) return <div><LoadingData/></div>;
    if (!ticket) return <div><EmptyData/></div>;
    return (
        <main>
            <p>{ticket.resource.name}</p>
            <p>{ticket.location}</p>
            <p>{ticket.category}</p>
            <p>{ticket.priority}</p>
            <p>{ticket.status}</p>
            <p>{ticket.description}</p>
            <p>{ticket.contactPhone}</p>
            <p>{ticket.assignedTo}</p>
            <p>{ticket.resolutionNotes}</p>
            <p>{ticket.createdAt}</p>
            <p>{ticket.updatedAt}</p>
            <MarkdownPreview content={ticket.description} />
            <TicketAttachmentView images={ticket.attachments}/>
        </main>
    )
}
