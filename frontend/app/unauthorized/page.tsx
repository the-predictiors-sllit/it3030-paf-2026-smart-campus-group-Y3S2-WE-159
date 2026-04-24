"use client"
import { FolderXIcon, Home } from "lucide-react"

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
export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="text-destructive">
                        <FolderXIcon />
                    </EmptyMedia>
                    <EmptyTitle>Access denied!</EmptyTitle>
                    <EmptyDescription>
                        You don't have permission to view this page. Contact your administrator if you think this is a mistake.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center gap-2">
                    <Button onClick={() => router.push(`/`)}><Home /> Go Back Home</Button>
                </EmptyContent>
            </Empty>
        </div>
  )
}
