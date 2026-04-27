import Link from 'next/link'
import { AddComments } from '@/components/custom/AddComments'
import { TicketPreview } from '@/components/custom/TicketPreview'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
        const { id } = await params
    
    return (
        <main className="space-y-6 p-5">
            {/* Navigation */}
            <div className="flex items-center gap-2">
                                <Button
                                        asChild
                                        variant="ghost"
                    size="sm"
                    className="gap-2"
                >
                                        <Link href="/tickets/myticket">
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </Link>
                </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ticket Details - 2 columns on lg */}
                <div className="lg:col-span-2 space-y-6">
                    <TicketPreview ticketId={id} />
                </div>

                {/* Comments Sidebar - 1 column on lg */}
                <div className="lg:col-span-1">
                    <AddComments ticketId={id} />
                </div>
            </div>
        </main>
    )
}