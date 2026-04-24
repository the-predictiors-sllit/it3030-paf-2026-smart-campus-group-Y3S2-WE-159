"use client"

import dynamic from "next/dynamic"
import { FormEvent, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
})

type ManageUserSendNotificationProps = {
  user: {
    user_id: string
    name: string
    email: string | null
  }
  onSendSuccess?: () => void
}

export const ManageUserSendNotification = ({
  user,
  onSendSuccess,
}: ManageUserSendNotificationProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [title, setTitle] = useState(`Notification for ${user.name}`)
  const [message, setMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const colorMode =
    isMounted && (resolvedTheme ?? theme) === "dark"
      ? "dark"
      : isMounted
      ? "light"
      : undefined

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error("Please add a notification title.")
      return
    }

    if (!message.trim()) {
      toast.error("Please add a notification message.")
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        userId: user.user_id,
        type: "CUSTOM",
        title: title.trim(),
        message: message.trim(),
      }

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage =
          errorBody?.error?.message || errorBody?.message || "Failed to send notification."
        throw new Error(errorMessage)
      }

      toast.success("Notification sent successfully.")
      setTitle(`Notification for ${user.name}`)
      setMessage("")
      onSendSuccess?.()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to send notification."
      toast.error(message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send custom notification</DialogTitle>
          <DialogDescription>
            Send a markdown notification directly to the selected user.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label htmlFor="notification-title">Title</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <Label htmlFor="notification-message">Message</Label>
            {isMounted ? (
              <div className="rounded-lg border border-input bg-background p-1">
                <MDEditor
                  value={message}
                  onChange={(value) => setMessage(value || "")}
                  preview="edit"
                  minHeight={220}
                  height={320}
                  data-color-mode={colorMode}
                  textareaProps={{
                    id: "notification-message",
                    placeholder: "Write your notification in markdown...",
                  }}
                  style={{
                              backgroundColor: "var(--color-card)", 
                            }}
                            previewOptions={{
                              style: { backgroundColor: "transparent" },
                            }}
                />
              </div>
            ) : (
              <Input
                id="notification-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your notification in markdown..."
              />
            )}
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Sending..." : "Send notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  )
}
