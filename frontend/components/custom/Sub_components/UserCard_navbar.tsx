"use client";
import React, { useMemo } from 'react'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/lib/auth-context'
import { getRoleDisplayName } from '@/lib/roles'
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link";

import { Badge } from "@/components/ui/badge"
import { BadgeCheck, EditIcon, LogOut } from "lucide-react"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const UserCard_navbar = () => {
    const {
        name,
        email,
        primaryRole,
        loading,
        error
    } = useAuth();
    const router = useRouter()
    const handleProfileClick = () =>{
        router.push("/user/profile")
    }
    
    let avatar_image = "https://images.pexels.com/photos/2103864/pexels-photo-2103864.jpeg"
    let avatar_image_alt = name ?? "Unknown User";
    const userName = name ?? "Unknown User";
    const userEmail = email ?? "unknown@university.edu";
    const userAccessLevel = primaryRole ? getRoleDisplayName(primaryRole) : "User";
    const avatarFallback = useMemo(() => initialsFromName(userName), [userName]);

    if (loading) {
        // return <div className="text-sm text-muted-foreground">Loading user...</div>;
        return (
            <div className="flex w-fit items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="grid gap-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </div>
        )
    }

    if (error) {
        console.log(`Profile error: ${error}`)
        return <div className="text-sm text-red-500">!!!</div>;
    }


    return (
        <div className="flex items-center justify-center">
            <HoverCard openDelay={100} closeDelay={200}>
                <HoverCardTrigger>
                    <div className="flex cursor-pointer items-center gap-2">
                        <Avatar className="size-8">
                            <AvatarImage
                                src={avatar_image}
                                alt={avatar_image_alt}
                            />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium hover:underline">
                                {userName}
                            </p>
                            <p className="text-muted-foreground text-xs">{userEmail}</p>
                        </div>
                    </div>
                </HoverCardTrigger>

                <HoverCardContent className="mx-3">
                    <div className="flex space-x-2">
                        <Avatar className="size-10 shrink-0">
                            <AvatarImage
                                src={avatar_image}
                                alt={avatar_image_alt}
                            />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div>
                                <p className="text-sm font-medium hover:underline">
                                    {userName}
                                </p>
                                <p className="text-muted-foreground text-xs">{userEmail}</p>
                            </div>
                            <Badge variant="secondary">
                                <BadgeCheck data-icon="inline-start" />
                                {userAccessLevel}
                            </Badge>
                            <div className='flex flex-row gap-3'>

                            <Button variant={"link"} className=' text-[10px] p-0 m-0' onClick={handleProfileClick}><EditIcon/>Profile</Button>
                            <Button variant={"link"} className=' text-[10px] p-0 m-0'><LogOut/>Logout</Button>
                            </div>
                            {/* <div className="flex items-center gap-1">
                                <CalendarIcon className="size-3.5 opacity-60" />
                                <span className="text-muted-foreground text-xs leading-none">
                                    Joined {joinedDate}
                                </span>
                            </div> */}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    )
}
