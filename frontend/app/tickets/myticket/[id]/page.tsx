"use client"
import { AddComments } from '@/components/custom/AddComments';
import { TicketPreview } from '@/components/custom/TicketPreview';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const page = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    return (
        <main className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
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

export default page