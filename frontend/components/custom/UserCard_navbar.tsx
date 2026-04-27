"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/lib/auth-context';
import { getRoleDisplayName } from '@/lib/roles';
import { useMemo } from 'react';

import { Badge } from "@/components/ui/badge";
import { BadgeCheck, EditIcon, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Spinner } from "../ui/spinner";

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
        picture,
        primaryRole,
        loading,
        error
    } = useAuth();
    const router = useRouter()
    const handleProfileClick = () =>{
        router.push("/user/profile")
    }
    const handleLogoutClick = () => {
        window.location.assign('/auth/logout?returnTo=%2Fauth%2Flogin');
    }

    const avatarImage = picture ?? "";
    const avatarImageAlt = name ?? "Unknown User";
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
        return <div className="text-sm "><Spinner/></div>;
    }


    return (
        <div className="flex items-center justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="flex cursor-pointer items-center gap-2">
                        <Avatar className="size-8">
                            <AvatarImage
                                src={avatarImage}
                                alt={avatarImageAlt}
                            />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium hover:underline">
                                {userName}
                            </p>
                            <p className="text-muted-foreground text-xs">{userEmail}</p>
                        </div>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="flex space-x-2">
                        <Avatar className="size-10 shrink-0">
                            <AvatarImage
                                src={avatarImage}
                                alt={avatarImageAlt}
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
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick}>
                        <EditIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={handleLogoutClick}>
                        <LogOut />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
