"use client"
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getBaseUrl } from "@/lib/api-client"
import { Auth0ErrorProp } from "@/lib/Auth0ErrorPrope"
import { useState } from "react"
import { toast } from "sonner"

export const ManageUserDelete = ({
  userId,
  token,
  onDeleteSuccess
}: any) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Auth0ErrorProp | null>(null)
  const Api_Url = getBaseUrl()
  const handleDelete = async () => {
    setLoading(true)
    console.log("Api_Url: " + Api_Url)
    console.log("token: " + token)

    try {
      const response = await fetch(`/api/auth0/management/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: {
          // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status == 204 && response.ok) {
        toast.success("User removed successfully")
        await onDeleteSuccess();
      } else {
        const errorData: Auth0ErrorProp = await response.json()
        setError(errorData)
        toast.error("Error! Can't remove user.")
        throw new Error(errorData.message || "Failed to delete the item.")
      }
    } catch (err) {
      toast.error(error?.message || "An error occurred")
      console.log(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete this
          account from the server.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete} variant={"destructive"}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
