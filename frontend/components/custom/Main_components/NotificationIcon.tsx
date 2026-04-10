import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell } from 'lucide-react'
import React from 'react'
import { Notification } from './Notification'
import { useRouter } from 'next/navigation'




export const NotificationIcon = () => {
    const router = useRouter()
    const handleViewAllClick = () =>{
        router.push("/notifications")
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-100 m-5 shadow-2xl max-h-[80vh] overflow-y-auto">
                <DropdownMenuGroup>
                    <div className='flex justify-between'>
                        <DropdownMenuLabel className='font-bold text-md'>Notifications</DropdownMenuLabel>
                        <Button variant={"link"} onClick={handleViewAllClick}>View All</Button>
                    </div>
                    <Notification />
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
