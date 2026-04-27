import { fetchFromInternalApi } from "@/lib/server-api"
import TicketDetailClient from "./TicketDetailClient"

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

interface TicketResponse {
  status: string
  data: TicketData
  error?: {
    code?: string
    message?: string
  } | null
}

interface TicketCommentsResponse {
  status: string
  data: any[]
}

interface UserResponse {
  status: string
  data?: {
    id?: string
  }
}

async function fetchTicket(ticketId: string) {
  const response = await fetchFromInternalApi<TicketResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}`,
    { next: { revalidate: 15 } }
  )

  if (!response || response.status !== "success") {
    return null
  }

  return response.data
}

async function fetchComments(ticketId: string) {
  const response = await fetchFromInternalApi<TicketCommentsResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}/comments`,
    { next: { revalidate: 15 } }
  )

  if (!response || response.status !== "success") {
    return []
  }

  return response.data || []
}

async function fetchCurrentUserId() {
  const response = await fetchFromInternalApi<UserResponse>("/api/user", {
    next: { revalidate: 15 },
  })

  if (!response || response.status !== "success") {
    return ""
  }

  return response?.data?.id ? String(response.data.id) : ""
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ticketId = decodeURIComponent(id)

  const [initialTicket, initialComments, initialCurrentUserId] =
    await Promise.all([
      fetchTicket(ticketId),
      fetchComments(ticketId),
      fetchCurrentUserId(),
    ])

  return (
    <TicketDetailClient
      ticketId={ticketId}
      initialTicket={initialTicket}
      initialComments={initialComments}
      initialCurrentUserId={initialCurrentUserId}
    />
  )
}
