import Link from 'next/link'
import { ResourceView } from '@/components/custom/ResourceView'
import { fetchFromInternalApi } from '@/lib/server-api'
import { AlertTriangle, CalendarCheck } from 'lucide-react'

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
    <main className="min-h-screen bg-background p-5">

      {/* Page body */}
      <div className="mx-auto">
        <section className="flex gap-8 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <ResourceView id={id} initialResource={initialResource} />
          </div>

          {/* Sticky sidebar */}
          <aside className="w-64 shrink-0 sticky top-20">
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">

              {/* Sidebar header */}
              <div className="bg-primary px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                  Actions
                </p>
                <p className="mt-0.5 text-sm text-primary-foreground font-medium">
                  What would you like to do?
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">

                {/* Book Now — primary */}
                <Link
                  href={`/booking/${id}`}
                  className="group w-full rounded-lg bg-primary px-4 py-3.5 text-left transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/15 shrink-0">
                      <CalendarCheck className="size-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">Book Now</p>
                      <p className="text-[11px] text-primary-foreground/60 mt-0.5">Reserve this resource</p>
                    </div>
                  </div>
                </Link>

                {/* Incident Ticket — secondary */}
                <Link
                  href={`/tickets/${id}`}
                  className="group w-full rounded-lg border border-border/60 bg-background px-4 py-3.5 text-left transition-all hover:bg-muted/60 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 shrink-0">
                      <AlertTriangle className="size-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Incident Ticket</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Report an issue</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Footer hint */}
              <div className="border-t border-border/50 px-5 py-3">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Bookings are subject to availability windows shown below.
                </p>
              </div>
            </div>
          </aside>

        </section>
      </div>
    </main>
  )
}