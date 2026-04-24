"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Edit2Icon, EyeIcon, TrashIcon, PlusIcon, SearchIcon, SlidersHorizontal, FilterX } from "lucide-react"

interface Resource {
    id: string
    name: string
    type: "ROOM" | "LAB" | "EQUIPMENT"
    capacity?: number
    location: string
    status: "ACTIVE" | "OUT_OF_SERVICE"
    description?: string
    imageUrl?: string
    createdAt?: string
}

interface ListResponse {
    items: Resource[]
    total: number
    page: number
    totalPages: number
}

export const ViewResourcesTable = () => {
    const router = useRouter()
    const ALL_FILTER = "ALL"
    const [resources, setResources] = useState<Resource[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState(ALL_FILTER)
    const [statusFilter, setStatusFilter] = useState(ALL_FILTER)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [totalPages, setTotalPages] = useState(0)

    const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Fetch resources
    const fetchResources = async () => {
        try {
            setIsLoading(true)
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            if (search) queryParams.append("search", search)
            if (typeFilter !== ALL_FILTER) queryParams.append("type", typeFilter)
            if (statusFilter !== ALL_FILTER) queryParams.append("status", statusFilter)

            const response = await fetch(`/api/resources?${queryParams.toString()}`)
            const result = await response.json()

            if (result.status === "success") {
                setResources(result.data.items)
                setTotalPages(result.data.totalPages)
            } else {
                toast.error(result.error?.message || "Failed to load resources")
            }
        } catch (error) {
            console.error("Error fetching resources:", error)
            toast.error("Failed to load resources")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setPage(1) // Reset to first page when filters change
    }, [search, typeFilter, statusFilter])

    useEffect(() => {
        fetchResources()
    }, [search, typeFilter, statusFilter, page])

    // Delete resource
    const handleDelete = async () => {
        if (!resourceToDelete) return

        try {
            setIsDeleting(true)
            const response = await fetch(`/api/resources/${resourceToDelete.id}`, {
                method: "DELETE",
            })

            if (response.ok || response.status === 204) {
                toast.success("Resource deleted successfully")
                setIsDeleteAlertOpen(false)
                setResourceToDelete(null)
                fetchResources()
            } else {
                const result = await response.json()
                toast.error(result.error?.message || "Failed to delete resource")
            }
        } catch (error) {
            console.error("Error deleting resource:", error)
            toast.error("You can not delete this Resource.")
        } finally {
            setIsDeleting(false)
        }
    }

    // View resource
    const handleView = (resource: Resource) => {
        setSelectedResource(resource)
        setIsViewDialogOpen(true)
    }

    // Edit resource
    const handleEdit = (resource: Resource) => {
        router.push(`/admin/resources/editResources/${resource.id}`)
    }

    // Type badge color
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "ROOM":
                return "bg-blue-100 text-blue-800"
            case "LAB":
                return "bg-purple-100 text-purple-800"
            case "EQUIPMENT":
                return "bg-amber-100 text-amber-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Status badge color
    const getStatusBadgeColor = (status: string) => {
        return status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-red-100 text-red-800"
    }

    const hasSearch = search.trim().length > 0
    const hasTypeFilter = typeFilter !== ALL_FILTER
    const hasStatusFilter = statusFilter !== ALL_FILTER
    const hasActiveFilters = hasSearch || hasTypeFilter || hasStatusFilter
    const activeFilterCount = [hasSearch, hasTypeFilter, hasStatusFilter].filter(Boolean).length

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manage Resources</h1>
                    <p className="text-muted-foreground mt-1">View, edit, and manage all campus resources</p>
                </div>
                <Button
                    onClick={() => router.push("/admin/resources/addResources")}
                    className="gap-2"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Resource
                </Button>
            </div>

            {/* Filters Card */}
            <Card className="border border-border/50 bg-linear-to-b from-background to-muted/20">
                <div className="p-6 space-y-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="rounded-md border border-border/60 bg-background p-2">
                                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold tracking-tight">Search & Filter</h3>
                                <p className="text-xs text-muted-foreground">Narrow down resources by name, type, and status</p>
                            </div>
                        </div>
                        <Badge variant={hasActiveFilters ? "default" : "secondary"}>
                            {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                        <div className="space-y-2 xl:col-span-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Search by resource name</p>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="e.g., Main Lecture Hall"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 rounded-md border-border/60 bg-background pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 xl:col-span-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource type</p>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-10 border-border/60 bg-background w-full">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value={ALL_FILTER}>All Types</SelectItem>
                                        <SelectItem value="ROOM">Room</SelectItem>
                                        <SelectItem value="LAB">Lab</SelectItem>
                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 xl:col-span-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Availability status</p>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 border-border/60 bg-background w-full">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value={ALL_FILTER}>All Status</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="xl:col-span-1 xl:self-end">
                            <Button
                                variant="outline"
                                className="h-10 w-full"
                                onClick={() => {
                                    setSearch("")
                                    setTypeFilter(ALL_FILTER)
                                    setStatusFilter(ALL_FILTER)
                                    setPage(1)
                                }}
                                disabled={!hasActiveFilters}
                            >
                                <FilterX className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                            <span className="text-xs text-muted-foreground">Active:</span>
                            {hasSearch && <Badge variant="secondary">Search: {search}</Badge>}
                            {hasTypeFilter && <Badge variant="secondary">Type: {typeFilter}</Badge>}
                            {hasStatusFilter && <Badge variant="secondary">Status: {statusFilter}</Badge>}
                        </div>
                    )}
                </div>
            </Card>

            {/* Resources Table */}
            <Card className="border border-border/50 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-muted-foreground text-lg">No resources found</p>
                        <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border/50">
                                        <TableHead className="font-semibold">Name</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Location</TableHead>
                                        <TableHead className="font-semibold">Capacity</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resources.map((resource) => (
                                        <TableRow key={resource.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="space-y-1">
                                                    <p>{resource.name}</p>
                                                    <p className="text-xs text-muted-foreground">{resource.id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeBadgeColor(resource.type)}>
                                                    {resource.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{resource.location}</TableCell>
                                            <TableCell>
                                                {resource.capacity ? `${resource.capacity} people` : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(resource.status)}>
                                                    {resource.status === "ACTIVE" ? "Active" : "Out of Service"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleView(resource)}
                                                        title="View details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(resource)}
                                                        title="Edit resource"
                                                    >
                                                        <Edit2Icon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setResourceToDelete(resource)
                                                            setIsDeleteAlertOpen(true)
                                                        }}
                                                        title="Delete resource"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-border/50 p-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === page}
                                                    onClick={() => setPage(p)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* View Resource Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Resource Details</DialogTitle>
                        <DialogDescription>
                            View complete information about this resource
                        </DialogDescription>
                    </DialogHeader>

                    {selectedResource && (
                        <div className="space-y-6">
                            <div className="relative h-64 bg-muted rounded-lg overflow-hidden border border-border/50">
                                {selectedResource.imageUrl ? (
                                    <img
                                        src={`/api/upload/view?fileName=${encodeURIComponent(selectedResource.imageUrl)}`}
                                        alt={selectedResource.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No image to display
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-lg font-semibold mt-1">{selectedResource.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <Badge className={`mt-1 ${getTypeBadgeColor(selectedResource.type)}`}>
                                        {selectedResource.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                                    <p className="text-lg font-semibold mt-1">{selectedResource.location}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge className={`mt-1 ${getStatusBadgeColor(selectedResource.status)}`}>
                                        {selectedResource.status === "ACTIVE" ? "Active" : "Out of Service"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {selectedResource.capacity ? `${selectedResource.capacity} people` : "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-lg font-semibold mt-1">
                                        {selectedResource.createdAt
                                            ? new Date(selectedResource.createdAt).toLocaleDateString()
                                            : "Not available"}
                                    </p>
                                </div>
                            </div>

                            {selectedResource.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="text-base mt-2 text-foreground/80">{selectedResource.description}</p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewDialogOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsViewDialogOpen(false)
                                        handleEdit(selectedResource)
                                    }}
                                    className="gap-2"
                                >
                                    <Edit2Icon className="h-4 w-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{resourceToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
