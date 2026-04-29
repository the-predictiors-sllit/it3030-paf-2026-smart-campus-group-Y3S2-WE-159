"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  Timeline,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AvailabilityDisplay } from "@/components/custom/AvailabilityDisplay"

import { formatTime } from "@/lib/formatTime"
import { cn } from "@/lib/utils"
import { CalendarClock, ImageOff, MapPin, Users, Clock } from "lucide-react"

interface AvailabilityWindow {
  day: string
  startTime: string
  endTime: string
}

interface ResourcesData {
  id: string
  name: string
  type: string
  capacity: number | null
  location: string
  status: string
  description: string
  imageUrl?: string
  availabilityWindows: AvailabilityWindow[]
  createdAt: string
}

interface ApiResponseProps {
  data: ResourcesData
  status: string
  error: string | null
}

export const ResourceView = ({
  id,
  initialResource,
}: {
  id: string
  initialResource?: ResourcesData | null
}) => {
  const [resource, setResource] = useState<ResourcesData | null>(
    initialResource ?? null
  )
  const [loading, setLoading] = useState(!initialResource)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (initialResource) {
      setResource(initialResource)
      setImageError(false)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/resources/${encodeURIComponent(id)}`,
          { method: "GET" }
        )
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }
        const result: ApiResponseProps = await response.json()
        if (result.status === "success") {
          setResource(result.data)
          setImageError(false)
        }
      } catch (error) {
        toast.warning("Something went wrong!")
        console.error("Failed to fetch resource:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, initialResource])

  if (loading) {
    return (
      <main className="w-full space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60">
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <Skeleton className="h-52 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        <Card className="border-border/60">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!resource) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Resource not found</CardTitle>
          <CardDescription>
            Unable to load the selected resource details.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isActive = resource.status === "ACTIVE"

  return (
    <main className="w-full space-y-6 pr-5">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {resource.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Resource ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{resource.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs font-medium">
            {resource.type}
          </Badge>
          <Badge
            className={cn(
              "text-xs font-semibold",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            <span className={cn(
              "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
              isActive ? "bg-primary-foreground/70" : "bg-destructive-foreground/70"
            )} />
            {isActive ? "Active" : "Out of Service"}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Details Card */}
        <Card className="lg:col-span-3 border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Resource Details</CardTitle>
            <CardDescription className="text-xs">
              Core information and usage context.
            </CardDescription>
          </CardHeader>

          <Separator className="mb-0" />

          <CardContent className="pt-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resource.description || "No description available."}
            </p>

            {/* Stat Pills */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/40 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <MapPin className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Location</p>
                  <p className="text-sm font-medium truncate">{resource.location || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/40 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <Users className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Capacity</p>
                  <p className="text-sm font-medium">{resource.capacity ?? "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/40 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                  <CalendarClock className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Created</p>
                  <p className="text-sm font-medium truncate">
                    {new Date(resource.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="border-border/60 shadow-sm lg:col-span-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Preview</CardTitle>
          </CardHeader>
          <Separator className="mb-0" />
          <CardContent className="pt-0">
            <div className="relative h-60 w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30">
              {resource.imageUrl && !imageError ? (
                <img
                  src={`/api/upload/view?fileName=${encodeURIComponent(resource.imageUrl)}`}
                  alt={resource.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ImageOff className="size-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs">No image available</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Timeline */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Clock className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Availability Windows</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Operating schedule across available days.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator className="mb-0" />

        <CardContent className="pt-6">
          {resource.availabilityWindows && resource.availabilityWindows.length > 0 ? (
            <Timeline defaultValue={0} className="w-full">
              {resource.availabilityWindows.map((item, index) => (
                <TimelineItem
                  key={index}
                  step={index}
                  className={cn(
                    "w-[calc(50%-1.5rem)] odd:ms-auto even:me-auto even:text-right even:group-data-[orientation=vertical]/timeline:ms-0 even:group-data-[orientation=vertical]/timeline:me-8",
                    "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:-right-6 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:left-auto",
                    "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:translate-x-1/2 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:-right-6",
                    "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:left-auto even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:translate-x-1/2"
                  )}
                >
                  <TimelineHeader>
                    <TimelineSeparator />
                    <TimelineTitle className="font-semibold text-sm">{item.day}</TimelineTitle>
                    <TimelineDate className="text-xs font-mono text-muted-foreground">
                      {formatTime(item.startTime)} — {formatTime(item.endTime)}
                    </TimelineDate>
                    <TimelineIndicator className="bg-primary border-primary" />
                  </TimelineHeader>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <Clock className="size-8 opacity-30" />
              <p className="text-sm">No availability windows configured.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AvailabilityDisplay resourceId={resource.id} />
    </main>
  )
}