import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/useNotifications"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { NotificationBox } from "./NotificationBox"

export const NotificationIcon = () => {
  const router = useRouter()
  const handleViewAllClick = () => {
    router.push("/notifications")
  }
  const { notifications, loading } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onSelect={(e) => e.preventDefault()}>
        <Button variant="outline" size="icon" className="rounded-full bg-transparent">
          <Bell />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="m-5 max-h-[80vh] min-w-100 overflow-y-auto shadow-2xl">
        <DropdownMenuGroup>
          <div className="flex justify-between">
            <DropdownMenuLabel className="text-md font-bold">
              Notifications
            </DropdownMenuLabel>
            <Button variant={"link"} onClick={handleViewAllClick}>
              View All
            </Button>
          </div>
          <DropdownMenuGroup>
            {!loading ? (
              notifications.map((notification) => (
                <DropdownMenuItem>
                  <NotificationBox
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    createdAt={notification.createdAt}
                    read={notification.read}
                  />
                </DropdownMenuItem>
              ))
            ) : (
              <div>
                <Card className="m-5 mb-2">
                  <CardContent>
                    <Skeleton className="my-1 h-4 w-1/2" />
                    <Skeleton className="my-1 h-4 w-2/3" />
                    <Skeleton className="my-1 h-4 w-1/4" />
                  </CardContent>
                </Card>
                <Card className="m-5 mb-2">
                  <CardContent>
                    <Skeleton className="my-1 h-4 w-1/2" />
                    <Skeleton className="my-1 h-4 w-2/3" />
                    <Skeleton className="my-1 h-4 w-1/4" />
                  </CardContent>
                </Card>
                <Card className="m-5 mb-2">
                  <CardContent>
                    <Skeleton className="my-1 h-4 w-1/2" />
                    <Skeleton className="my-1 h-4 w-2/3" />
                    <Skeleton className="my-1 h-4 w-1/4" />
                  </CardContent>
                </Card>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
