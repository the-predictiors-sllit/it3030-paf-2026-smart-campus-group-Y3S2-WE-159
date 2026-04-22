"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Search, SearchX, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { ResourceListCard } from "@/components/custom/ResourceListCard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { InputGroup } from "@/components/ui/input-group"

interface Resource {
  id: string
  name: string
  type: "ROOM" | "LAB" | "EQUIPMENT" | string
  capacity: number | null
  location: string
  status: "ACTIVE" | "OUT_OF_SERVICE" | string
  imageUrl?: string
  _links: {
    self: { href: string }
  }
}

interface ResourceResponse {
  _links: Record<string, unknown>
  data: {
    items: Resource[]
    total: number
    page: number
    totalPages: number
  } | null
  error: {
    code: string
    message: string
  } | null
  status: "success" | "error" | string
}

const DEFAULT_PAGE_SIZE = 10

function getTypeLabel(type: string) {
  switch (type) {
    case "ROOM":
      return "Room"
    case "LAB":
      return "Lab"
    case "EQUIPMENT":
      return "Equipment"
    default:
      return type
  }
}

function getStatusLabel(status: string) {
  return status === "OUT_OF_SERVICE" ? "Out of Service" : "Active"
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState("")
  const [activeSearch, setActiveSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_SIZE)

  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [minCapacity, setMinCapacity] = useState<string>("")
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams({
          page: String(currentPage),
          limit: String(rowsPerPage),
        })

        if (activeSearch.trim()) query.append("search", activeSearch.trim())
        if (selectedType !== "ALL") query.append("type", selectedType)
        if (selectedStatus !== "ALL") query.append("status", selectedStatus)
        if (minCapacity.trim()) query.append("minCapacity", minCapacity.trim())

        const response = await fetch(`/api/resources?${query.toString()}`, {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }

        const result: ResourceResponse = await response.json()

        if (result.status === "success" && result.data) {
          setResources(result.data.items)
          setTotalPages(result.data.totalPages || 1)
          setImageErrors({})
        } else if (result.error) {
          setResources([])
          setTotalPages(1)
          toast.error(result.error.message)
        } else {
          setResources([])
          setTotalPages(1)
          toast.warning("Received an unexpected response format.")
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to connect to the server"
        console.error("Error fetching resources:", error)
        setResources([])
        setTotalPages(1)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [
    activeSearch,
    currentPage,
    minCapacity,
    rowsPerPage,
    selectedStatus,
    selectedType,
  ])

  const applySearch = () => {
    setCurrentPage(1)
    setActiveSearch(searchInput.trim())
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setActiveSearch("")
    setSelectedType("ALL")
    setSelectedStatus("ALL")
    setMinCapacity("")
    setCurrentPage(1)
  }

  const hasNextPage = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  )
  const hasPreviousPage = useMemo(() => currentPage > 1, [currentPage])

  return (
    <main className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold md:text-3xl">
          Resource Directory
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Browse rooms, labs, and equipment.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4 xl:col-span-3">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="size-4" />
                Filters
              </CardTitle>
              <CardDescription>Find the right resource faster.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="resource-search"
                    type="search"
                    value={searchInput}
                    placeholder="Search by name"
                    className="pl-9"
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applySearch()
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setCurrentPage(1)
                      setSelectedType(value)
                    }}
                  >
                    <SelectTrigger className="w-65 lg:w-45">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="LAB">Lab</SelectItem>
                      <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => {
                      setCurrentPage(1)
                      setSelectedStatus(value)
                    }}
                  >
                    <SelectTrigger className="w-65 lg:w-45">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">
                        Out of Service
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-capacity">Minimum Capacity</Label>
                <Input
                  id="min-capacity"
                  type="number"
                  min={0}
                  placeholder="e.g. 20"
                  value={minCapacity}
                  onChange={(event) => {
                    setCurrentPage(1)
                    setMinCapacity(event.target.value)
                  }}
                />
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex gap-2">
                <Button className="w-full" onClick={applySearch}>
                  Apply Search
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear
                </Button>
              </div>
            </CardFooter>
          </Card>
        </aside>

        <div className="space-y-4 lg:col-span-8 xl:col-span-9">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}>
                  <div className="space-y-3 p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-24 w-full rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>No resources found</EmptyTitle>
                    <EmptyDescription>
                      No items match your current filters. Try a different
                      search term or clear filters.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Reset Search and Filters
                  </Button>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {resources.map((resource) => (
                  <ResourceListCard
                    key={resource.id}
                    id={resource.id}
                    name={resource.name}
                    typeLabel={getTypeLabel(resource.type)}
                    statusLabel={getStatusLabel(resource.status)}
                    isActive={resource.status === "ACTIVE"}
                    location={resource.location}
                    capacity={resource.capacity}
                    imageUrl={resource.imageUrl}
                    hasImageError={Boolean(imageErrors[resource.id])}
                    onImageError={() => {
                      setImageErrors((prev) => ({
                        ...prev,
                        [resource.id]: true,
                      }))
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <Card>
                  <CardContent className="flex flex-col items-start justify-between gap-3 pt-6 md:flex-row md:items-center">
                    <Field orientation="horizontal" className="w-fit">
                      <FieldLabel htmlFor="rows-per-page">
                        Rows per page
                      </FieldLabel>
                      <Select
                        value={String(rowsPerPage)}
                        onValueChange={(value) => {
                          setRowsPerPage(Number(value))
                          setCurrentPage(1)
                        }}
                      >
                        <SelectTrigger className="w-20" id="rows-per-page">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectGroup>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                              event.preventDefault()
                              if (hasPreviousPage)
                                setCurrentPage(currentPage - 1)
                            }}
                            className={
                              !hasPreviousPage
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(event) => {
                              event.preventDefault()
                              if (hasNextPage) setCurrentPage(currentPage + 1)
                            }}
                            className={
                              !hasNextPage
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
