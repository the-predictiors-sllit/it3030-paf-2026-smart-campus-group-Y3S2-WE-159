'use client'
import React, { useState } from 'react'
import { NotificationBox } from '@/components/custom/NotificationBox'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"




const Notifications = [
  {
    id: 2,
    title: "Booking Title",
    description: "This is description for booking",
    timePeriod: "2 min ago",
    isRead: false
  },
  {
    id: 1,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: true
  },
  {
    id: 7,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: true
  },
  {
    id: 3,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: false
  },
  {
    id: 4,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: false
  },
  {
    id: 5,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: true
  },
  {
    id: 6,
    title: "Ticket Title",
    description: "This is description for ticket",
    timePeriod: "5 min ago",
    isRead: true
  },
]
export const Notification = () => {
  const [loading, setLoading] = useState(false)
  if (loading) {
    return (
      <div>

        <Card className="m-5 mb-2">
          <CardContent>
            <Skeleton className="h-4 w-1/2 my-1" />
            <Skeleton className="h-4 w-2/3 my-1" />
            <Skeleton className="h-4 w-1/4 my-1" />
          </CardContent>
        </Card>
        <Card className="m-5 mb-2">
          <CardContent>
            <Skeleton className="h-4 w-1/2 my-1" />
            <Skeleton className="h-4 w-2/3 my-1" />
            <Skeleton className="h-4 w-1/4 my-1" />
          </CardContent>
        </Card>
        <Card className="m-5 mb-2">
          <CardContent>
            <Skeleton className="h-4 w-1/2 my-1" />
            <Skeleton className="h-4 w-2/3 my-1" />
            <Skeleton className="h-4 w-1/4 my-1" />
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div>
      {Notifications.map((item) => (
        <NotificationBox
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          timePeriod={item.timePeriod}
          isRead={item.isRead}
        />
      ))}
    </div>
  )
}
