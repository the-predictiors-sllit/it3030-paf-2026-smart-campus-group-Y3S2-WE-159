import { fetchFromInternalApi } from "@/lib/server-api"
import ViewTicketsClient from "./ViewTicketsClient"

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

async function fetchAllTickets(): Promise<TicketData[]> {
  const limit = 200
  let page = 1
  let totalPages = 1
  const allItems: TicketData[] = []

  do {
    const response = await fetchFromInternalApi<ApiResponse>(
      `/api/tickets?page=${page}&limit=${limit}`,
      { next: { revalidate: 30 } }
    )

    if (!response || response.status !== "success") {
      break
    }

    allItems.push(...(response.data.items || []))
    totalPages = response.data.totalPages || 1
    page += 1
  } while (page <= totalPages)

  return allItems
}

export default async function ViewTicketsPage() {
  const allTickets = await fetchAllTickets()
  const openTickets = allTickets.filter((ticket) => ticket.status === "OPEN")
  const otherTickets = allTickets.filter((ticket) => ticket.status !== "OPEN")

  return (
    <ViewTicketsClient
      initialOpenTickets={openTickets}
      initialOtherTickets={otherTickets}
    />
  )
}
