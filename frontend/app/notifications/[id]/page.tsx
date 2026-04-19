"use client"
import React, { useEffect, useState } from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import MarkdownPreview from "@/components/custom/MarkdownPreview"
import { Separator } from "@/components/ui/separator"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatNotificationDate } from "@/lib/formatDateTime"

const title = "Smart Campus: Incident Report"
const ReferenceId = "12222"
const datetime = "2026-03-21 11:00:00.000"
const description = ``

interface NotificationProps {
  id: string
  type: string
  title: string
  message: string
  referenceId: string
  read: string
  createdAt: string
}

interface ApiResponseProps {
  data: NotificationProps
  status: string
  error: string | null
}

const page = () => {
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const id = params.id as string

  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  )

  useEffect(() => {
    const fetchData = async () => {
      // const token = "token"

      try {
        const response = await fetch(
          `/api/notifications/${encodeURIComponent(id)}`,
          {
            method: "GET",
          }
        )

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }
        const result: ApiResponseProps = await response.json()

        if (result.status === "success") {
          setNotification(result.data)
        }
      } catch (error) {
        toast.warning("Something went wrong!")
        console.error("Failed to fetch notification:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="m-5">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <Separator />
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="m-5">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="mb-2 text-2xl font-bold">
            {notification?.title}
          </CardTitle>
          <p className="text-sm opacity-50">
            Reference Id - {notification?.referenceId}{" "}
          </p>
          <p className="text-sm opacity-50">
            Created at - {formatNotificationDate(notification?.createdAt)}{" "}
          </p>
        </CardHeader>
        <Separator />
        <CardContent>
          <MarkdownPreview content={notification?.message || ""} />
        </CardContent>
      </Card>
    </div>
  )
}

export default page
