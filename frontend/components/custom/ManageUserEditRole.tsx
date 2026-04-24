"use client"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export const ManageUserEditRole = ({
  user,
  token,
  onUpdateSuccess,
}: {
  user?: any
  token?: string
  onUpdateSuccess?: () => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!user) return;
      setDataLoading(true)
      try {
        const userId = user.user_id || user.id

        // 1. Fetch all generic roles first
        const allRolesRes = await fetch(`/api/auth0/management/roles`, {
          method: "GET",
          credentials: "same-origin",
        })

        let fetchedRoles = []
        if (allRolesRes.ok) {
          try {
            fetchedRoles = await allRolesRes.json()
            setAllRoles(fetchedRoles)
          } catch (e) {
            console.error("Could not parse all roles response", e)
          }
        }

        // 2. Fetch user roles
        const userRolesRes = await fetch(`/api/auth0/management/users/${encodeURIComponent(userId)}/roles`, {
          method: "GET",
          credentials: "same-origin",
        })

        let _userRoles = []
        if (userRolesRes.ok) {
          try {
            _userRoles = await userRolesRes.json()
            setUserRoles(_userRoles)
            // set first one as selected for now (if a user only has one primary role)
            if (_userRoles && _userRoles.length > 0) {
              setSelectedRole(_userRoles[0].id)
            } else {
              setSelectedRole("none")
            }
          } catch (e) {
            console.error("Could not parse user roles response", e)
          }
        }

      } catch (e) {
        console.error("Failed to load roles", e)
      } finally {
        setDataLoading(false)
      }
    }

    fetchRoleData()
  }, [user])

  const onSubmit = async () => {
    if (!user || (!user.user_id && !user.id)) return
    setLoading(true)
    const userId = user.user_id || user.id

    try {
      // 1. Remove ONLY the role we previously matched as their assigned role. 
      const rolesToRemove = userRoles.map(r => r.id)
      if (rolesToRemove.length > 0) {
        await fetch(`/api/auth0/management/users/${encodeURIComponent(userId)}/roles`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ roles: rolesToRemove })
        })
      }

      // 2. Assign the new one
      if (selectedRole !== "none" && selectedRole !== "") {
        await fetch(`/api/auth0/management/users/${encodeURIComponent(userId)}/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ roles: [selectedRole] })
        })
      }

      toast.success("User role updated successfully.")
      if (onUpdateSuccess) {
        await onUpdateSuccess()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred while updating roles.")
      console.log(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-sm">
      <div className="space-y-3">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Assign a role to {user?.name || "the user"}.
          </DialogDescription>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FieldGroup>
            <div className="mb-4 text-sm">
              <span className="font-semibold text-foreground">Current Role: </span>
              {userRoles && userRoles.length > 0 ? (
                <span className="text-muted-foreground">
                  {userRoles.map((r: any) => r.name).join(", ")}
                </span>
              ) : (
                <span className="text-muted-foreground italic">None</span>
              )}
            </div>

            <Field>
              <FieldLabel>Select New Role</FieldLabel>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="none">No Role</SelectItem>
                    {allRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name} {role.description ? `(${role.description})` : ""}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={loading || dataLoading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}
