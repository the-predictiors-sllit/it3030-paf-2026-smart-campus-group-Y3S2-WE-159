"use client"
import { Home } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"

export const LoadingData = () => {
    const router = useRouter();
    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Spinner />
                    </EmptyMedia>
                    <EmptyTitle>Processing your request</EmptyTitle>
                    <EmptyDescription>
                        Please wait while we process your request. Do not refresh the page.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    )
}
