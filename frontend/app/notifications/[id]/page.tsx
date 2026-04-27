import MarkdownPreview from "@/components/custom/MarkdownPreview"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNotificationDate } from "@/lib/formatDateTime"
import { fetchFromInternalApi } from "@/lib/server-api"

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

async function getNotification(id: string) {
  const response = await fetchFromInternalApi<ApiResponseProps>(
    `/api/notifications/${encodeURIComponent(id)}`,
    { next: { revalidate: 30 } }
  )

  if (!response || response.status !== "success") {
    return null
  }

  return response.data
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
