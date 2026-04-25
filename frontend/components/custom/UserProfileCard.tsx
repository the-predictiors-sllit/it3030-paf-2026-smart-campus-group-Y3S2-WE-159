"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { getRoleDisplayName } from "@/lib/roles"
import { BadgeCheck } from "lucide-react"

export const UserProfileCard = () => {
    const { auth0UserId, name, email, picture, primaryRole, loading } = useAuth()
    const [auth0Picture, setAuth0Picture] = useState<string | null>(null)

    const userName = name ?? "Unknown User"
    const userEmail = email ?? "unknown@university.edu"
    const userAccessLevel = primaryRole ? getRoleDisplayName(primaryRole) : "User"
    const fallbackInitials = useMemo(() => {
        const parts = userName.trim().split(/\s+/).filter(Boolean)
        if (parts.length === 0) return "U"
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }, [userName])
    const userPicture = auth0Picture ?? picture ?? undefined

    useEffect(() => {
        let active = true

        async function loadAuth0Picture() {
            if (!auth0UserId) return

            try {
                const res = await fetch(`/api/auth0/management/users/${encodeURIComponent(auth0UserId)}`, {
                    method: "GET",
                    cache: "no-store",
                })

                if (!res.ok) return

                const data = await res.json() as { picture?: unknown }
                if (active && typeof data.picture === "string" && data.picture.trim()) {
                    setAuth0Picture(data.picture)
                }
            } catch {
                // Keep fallback avatar from auth context when management API is unavailable.
            }
        }

        loadAuth0Picture()

        return () => {
            active = false
        }
    }, [auth0UserId])

    if (loading) {
        return (
            <main className='p-5 shadow-md rounded-lg h-full bg-card'>
                <div className='space-y-4'>
                    <Skeleton className='h-6 w-48' />
                    <Skeleton className='h-24 w-full' />
                </div>
            </main>
        )
    }

    return (
        <main className='p-5 shadow-md rounded-lg h-full bg-card'>
            <Card className='p-4 h-full'>
                <CardContent className='space-y-4'>
                    <div className='flex items-center gap-4'>
                        <Avatar className='size-16'>
                            {userPicture ? <AvatarImage src={userPicture} alt={`${userName} profile picture`} /> : null}
                            <AvatarFallback>{fallbackInitials}</AvatarFallback>
                        </Avatar>

                        <div>
                            <h2 className='text-xl font-semibold'>User Profile</h2>
                            <p className='text-sm text-muted-foreground'>Your account details</p>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>Name</p>
                        <p className='text-base font-medium'>{userName}</p>
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>Email</p>
                        <p className='text-base font-medium break-all'>{userEmail}</p>
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>Role</p>
                        <Badge variant="secondary" className='w-fit'>
                            <BadgeCheck data-icon="inline-start" />
                            {userAccessLevel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
