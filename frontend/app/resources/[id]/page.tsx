"use client"
import { ResourceView } from '@/components/custom/ResourceView';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, CalendarCheck, ArrowLeft } from 'lucide-react';

const page = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const handleBookingClick = () => {
    router.push(`/booking/${id}`)
  }
  const handleIncidentTicketClick = () => {
    router.push(`/tickets/${id}`)
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Page body */}
      <div className="mx-auto  px-6 py-8">
        <section className="flex gap-8 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <ResourceView id={id} />
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
                <button
                  onClick={handleBookingClick}
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
                </button>

                {/* Incident Ticket — secondary */}
                <button
                  onClick={handleIncidentTicketClick}
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
                </button>
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

export default page