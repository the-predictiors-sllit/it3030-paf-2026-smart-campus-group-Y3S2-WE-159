import { ResourceView } from '@/components/custom/ResourceView'
import { TicketForm } from '@/components/custom/TicketForm'
import { fetchFromInternalApi } from '@/lib/server-api'

interface AvailabilityWindow {
  day: string
  startTime: string
  endTime: string
}

interface ResourceData {
  id: string
  name: string
  type: string
  capacity: number | null
  location: string
  status: string
  description: string
  imageUrl?: string
  availabilityWindows: AvailabilityWindow[]
  createdAt: string
}

interface ResourceApiResponse {
  data: ResourceData
  status: string
  error: string | null
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const response = await fetchFromInternalApi<ResourceApiResponse>(
    `/api/resources/${encodeURIComponent(id)}`,
    { next: { revalidate: 60 } }
  )
  const initialResource =
    response?.status === 'success' ? response.data : null

  return (
    <main className='p-5'>
      <section className='flex flex-row gap-3'>
        <div className='basis-3/5'>
          <ResourceView id={id} initialResource={initialResource} />
        </div>
        <div className='basis-2/5'>
          <TicketForm resourceId={id} />
        </div>
      </section>
    </main>
  )
}