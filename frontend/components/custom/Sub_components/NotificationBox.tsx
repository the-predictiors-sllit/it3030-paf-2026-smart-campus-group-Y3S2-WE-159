"use client"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { useRouter } from "next/navigation"


// let title = "Basic Item"
// let description = "A simple item with title and description."
// let timePeriod = "2 days ago"
// let isRead = 1

interface NotificationProps{
  id: number
  title?: string;
  description?: string;
  timePeriod?: string
  isRead?: boolean
}

export const NotificationBox = ({id,title,description,timePeriod,isRead}:NotificationProps) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/notifications/${id}`)
  }
  return (
    <div onClick={handleClick}
    className='m-5 mb-2 cursor-pointer active:translate-1 transition duration-150'>
      <Item variant={`${isRead ? 'default':'muted'}`} className={`hover:border-primary transition duration-300 ease-in-out shadow-lg ${isRead && `opacity-60 hover:opacity-100`}`}>
        <ItemMedia variant="icon">
          <Bell/>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className='font-bold'>{title}</ItemTitle>
          <ItemDescription className='wrap-anywhere line-clamp-2'>{description}</ItemDescription>
          <ItemDescription className=" opacity-50">{timePeriod}</ItemDescription>
        </ItemContent>
        {/* <ItemActions>
          <Button>View</Button>
        </ItemActions> */}
      </Item>
    </div>
  )
}
