import React from 'react'
import { FocusCards } from "@/components/ui/focus-cards";


export const TicketAttachmentView = ({ images }: { images: string[] | null }) => {
    if (!images || images.length === 0) {
        return <p className="text-muted-foreground">No attachments available.</p>;
    }
    const cards = images.map((path, index) => ({
        title: `Attachment ${index + 1}`,
        src: `/api/upload/view?fileName=${encodeURIComponent(path)}`
    }));

    return (

        <FocusCards cards={cards} />
    )
}