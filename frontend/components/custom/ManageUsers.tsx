"use client"

import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { formatDateTime } from "@/lib/formatDateTime"
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { SearchIcon, UserPlusIcon } from "lucide-react"
import { Badge } from "../ui/badge"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { IconEdit, IconMessage2Share, IconTrashX, IconUserShield } from "@tabler/icons-react"
import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog"
import { ButtonGroup } from "../ui/button-group"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { ManageUserDelete } from "./ManageUserDelete"
import { ManageUserEditProfile } from "./ManageUserEditProfile"
import { ManageUserEditRole } from "./ManageUserEditRole"
import { ManageUserSendNotification } from "./ManageUserSendNotification"
import { ManageUserAddNew } from "./ManageUserAddNew"

// interface linksParentProps {
//   method: string | string
//   href: string
// }

// interface linksProps {
//   remove_user_role: linksParentProps
//   update_user_details: linksParentProps
//   get_all_roles: linksParentProps
//   self: linksParentProps
//   get_user_role: linksParentProps
//   delete_user: linksParentProps
//   Assign_user_role: linksParentProps
// }

interface userProp {
  user_id: string
  name: string
  nickname: string | null
  given_name: string | null
  family_name: string | null
  email: string | null
  picture: string
  email_verified: boolean
  created_at: string | null
  updated_at: string | null
  last_login: string
  last_ip: string | null
  logins_count: number | null
}

// interface roleProp {
//   id: string
//   name: string | null
//   description: string | null
//   _links: {
//     remove_user_role: linksParentProps
//     get_all_roles: linksParentProps
//     self: linksParentProps
//     Assign_user_role: linksParentProps
//   }
// }

// interface ApiUserResponseProp {
//   _links: {
//     self: linksParentProps
//     create_new_user: linksParentProps
//   }
//   data: {
//     items: userProp[]
//   }
//   error: {
//     code: string
//     message: string
//   } | null
//   status: string
// }

// interface ApiUserRoleResponseProp {
//   _links: {
//     self: linksParentProps
//   }
//   data: {
//     items: roleProp[]
//   }
//   error: {
//     code: string
//     message: string
//   } | null
//   status: string
// }

// @RequestParam(defaultValue = "0") int page,
// @RequestParam(defaultValue = "10") int perPage,
// @RequestParam(required = false) String sort,
// @RequestParam(required = false) String search)

function ActionsCell({
  row,
  token,
  refreshData,
}: {
  row: Row<userProp>
  token: string
  refreshData: () => Promise<void>
}) {
  const { copyToClipboard } = useCopyToClipboard()
  const handleCopyId = () => {
    copyToClipboard(row.original.user_id)

    toast.success("Employee ID successfully copied", {
      description: row.original.user_id,
    })
  }

  return (
    <ButtonGroup className="">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <IconEdit />
          </Button>
        </DialogTrigger>
        <ManageUserEditProfile user={row.original} token={token} onUpdateSuccessAction={refreshData} />
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <IconUserShield />
          </Button>
        </DialogTrigger>
        <ManageUserEditRole user={row.original} token={token} onUpdateSuccess={refreshData} />
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <IconMessage2Share />
          </Button>
        </DialogTrigger>
        <ManageUserSendNotification user={row.original} onSendSuccess={refreshData} />
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="cursor-pointer">
            <IconTrashX />
          </Button>
        </AlertDialogTrigger>
        <ManageUserDelete
          userId={row.original.user_id}
          token={token}
          onDeleteSuccess={refreshData}
        />
      </AlertDialog>
    </ButtonGroup>
  )
}

export function ManageUsers({ token }: { token: string }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "user", desc: true },
  ])
  const [searchQuery, setSearchQuery] = useState<string>("")

  const [searchColumn, setSearchColumn] = useState<string>("email")
  const [searchInputValue, setSearchInputValue] = useState<string>("")

  const handleSearch = () => {
    const finalQuery = searchInputValue
      ? `${searchColumn}:*${searchInputValue}*`
      : ""

    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setSearchQuery(finalQuery)
  }

  //   const [users, setUsers] = useState<userRoleProp[]>([])
  const [users, setUsers] = useState<userProp[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // console.log(users)

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: pagination.pageIndex.toString(),
        per_page: pagination.pageSize.toString(),
      }

      if (searchQuery) {
        params.q = searchQuery
      }
      const query = new URLSearchParams(params)

      console.log(query)

      const response = await fetch(
        `/api/auth0/management/users?${query.toString()}`,
        {
          method: "GET",
        }
      )

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result: userProp[] = await response.json()
      setUsers(result)
    } catch (err: any) {
      console.error("Error fetching data:", err)
      toast.error(err.message || "Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchResources()
  }, [pagination.pageIndex, pagination.pageSize, searchQuery])

  const columns = useMemo<ColumnDef<userProp>[]>(
    () => [
      // user
      // {
      //   accessorKey: "id",
      //   id: "id",
      //   header: () => <DataGridTableRowSelectAll />,
      //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      //   enableSorting: false,
      //   size: 35,
      //   meta: {
      //     headerClassName: "",
      //     cellClassName: "",
      //   },
      //   enableResizing: false,
      // },
      {
        accessorKey: "userId",
        id: "userId",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="User ID"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              <span> {row.original.user_id}</span>
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: "user",
        id: "user",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="User"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage
                  src={row.original.picture}
                  alt={row.original.name}
                />
                <AvatarFallback>
                  {row.original.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-foreground">
                  {row.original.name}
                </div>
                <div className="text-muted-foreground">
                  {row.original.email}
                </div>
              </div>
            </div>
          )
        },
        size: 200,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      //  ----------------------
      {
        accessorKey: "nickname",
        id: "nickname",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Nickname"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              {row.original.nickname ? (
                <span> {row.original.nickname}</span>
              ) : (
                <span className="text-xs opacity-50"> N/A </span>
              )}
            </div>
          )
        },
        size: 125,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "givenName",
        id: "givenName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Given Name"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              {row.original.given_name ? (
                <span> {row.original.given_name}</span>
              ) : (
                <span className="text-xs opacity-50"> N/A </span>
              )}
            </div>
          )
        },
        size: 125,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "familyName",
        id: "familyName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Family Name"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              {row.original.family_name ? (
                <span> {row.original.family_name}</span>
              ) : (
                <span className="text-xs opacity-50"> N/A </span>
              )}
            </div>
          )
        },
        size: 125,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "emailVerified",
        id: "emailVerified",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email Verified"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              {row.original.email_verified ? (
                <Badge variant={"default"}>True</Badge>
              ) : (
                <Badge variant={"outline"}>False</Badge>
              )}
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Created At"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              <div className="text-foreground">
                {formatDateTime(row.original.created_at)}
              </div>
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "updatedAt",
        id: "updatedAt",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Updated At"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              <div className="text-foreground">
                {formatDateTime(row.original.updated_at)}
              </div>
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "lastLogin",
        id: "lastLogin",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Last Login"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              <div className="text-foreground">
                {row.original.last_login ? (
                  <span> {formatDateTime(row.original.last_login)}</span>
                ) : (
                  <span className="text-xs opacity-50"> N/A </span>
                )}
              </div>
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      //  ----------------------
      {
        accessorKey: "lastIp",
        id: "lastIp",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Last IP"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              <div className="text-foreground">
                {row.original.last_ip ? (
                  <span> {row.original.last_ip}</span>
                ) : (
                  <span className="text-xs opacity-50"> N/A </span>
                )}
              </div>
            </div>
          )
        },
        size: 150,
        meta: {
          headerClassName: "",
          cellClassName: "text-start",
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //  ----------------------
      {
        accessorKey: "loginsCount",
        id: "loginsCount",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Logins Count"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="text-foreground">
              {row.original.logins_count ? (
                <span> {row.original.logins_count}</span>
              ) : (
                <span className="text-xs opacity-50"> 0 </span>
              )}
            </div>
          )
        },
        size: 150,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      //   action
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ActionsCell row={row} token={token} refreshData={fetchResources} />
        ),

        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    []
  )

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  )

  const table = useReactTable({
    columns,
    data: users,
    // pageCount: Math.ceil(0 / pagination.pageSize),
    // getRowId: (row: userProp) => row.userId,
    pageCount:
      users.length === pagination.pageSize ? -1 : pagination.pageIndex + 1,
    manualPagination: true,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: "onChange",
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={users.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card className="w-full gap-3 py-0">
        <CardHeader className="flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-row items-center gap-0">
              <Select value={searchColumn} onValueChange={setSearchColumn}>
                <SelectTrigger className="w-full max-w-35 rounded-r-none border-r-0">
                  <SelectValue placeholder="Select a Column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Columns</SelectLabel>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="given_name">Given Name</SelectItem>
                    <SelectItem value="nickname">Nickname</SelectItem>
                    <SelectItem value="family_name">Family Name</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex">
                <Input
                  className="rounded-none border-r-0 focus-visible:ring-0"
                  placeholder="Type to search..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  // Allow pressing "Enter" to search
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="outline"
                  className="rounded-l-none"
                  onClick={handleSearch}
                >
                  <SearchIcon className="mr-2 size-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
          <CardAction>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  <UserPlusIcon />
                  Add new
                </Button>
              </DialogTrigger>
              <ManageUserAddNew onCreateSuccess={fetchResources} />
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent className="border-y px-0">
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </CardContent>
        <CardFooter className="border-none bg-transparent! px-3.5 py-2">
          <DataGridPagination />
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  // Disable if on the first page
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={() => table.previousPage()}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  // Disable if there's no more data
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={() => table.nextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </DataGrid>
  )
}
