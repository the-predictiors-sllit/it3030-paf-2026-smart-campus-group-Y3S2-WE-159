"use client"
import { ArrowUpRightIcon, FolderXIcon, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { useRouter } from "next/navigation"

export const EmptyData = () => {
    const router = useRouter();
    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderXIcon />
                    </EmptyMedia>
                    <EmptyTitle>No Content Found</EmptyTitle>
                    <EmptyDescription>
                        There is nothing to display here at the moment. Please check back later.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button onClick={() => router.push(`/`)}><Home /> Go Back Home</Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}
