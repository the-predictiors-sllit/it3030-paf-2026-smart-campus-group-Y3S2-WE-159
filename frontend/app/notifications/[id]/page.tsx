import MarkdownPreview from "@/components/custom/MarkdownPreview"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SERVER_API_URL } from "@/lib/api-client"
import { auth0 } from "@/lib/auth0"
import { formatNotificationDate } from "@/lib/formatDateTime"

interface NotificationProps {
  id: string
  type: string
  title: string
  message: string
  referenceId: string
  read: boolean
  createdAt: string
}

interface ApiResponseProps {
  data: NotificationProps | null
  status: string
  error: {
    code: string
    message: string
  } | null
}

async function getNotification(id: string) {
  const session = await auth0.getSession()

  if (!session?.user) {
    return null
  }

  const { token } = await auth0.getAccessToken()
  const response = await fetch(
    `${SERVER_API_URL}/api/notifications/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    return null
  }

  const result = (await response.json()) as ApiResponseProps

  if (result.status !== "success" || !result.data) {
    return null
  }

  return result.data
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const notification = await getNotification(id)

  if (!notification) {
    return (
      <div className="m-5">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="mb-2 text-2xl font-bold">
              Notification not found
            </CardTitle>
            <p className="text-sm opacity-50">
              Unable to load the selected notification.
            </p>
          </CardHeader>
          <Separator />
          <CardContent>
            <Skeleton className="h-24 w-full" />
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
            {notification.title}
          </CardTitle>
          <p className="text-sm opacity-50">
            Reference Id - {notification.referenceId}{" "}
          </p>
          <p className="text-sm opacity-50">
            Created at - {formatNotificationDate(notification.createdAt)}{" "}
          </p>
        </CardHeader>
        <Separator />
        <CardContent>
          <MarkdownPreview content={notification.message || ""} />
        </CardContent>
      </Card>
    </div>
  )
}
