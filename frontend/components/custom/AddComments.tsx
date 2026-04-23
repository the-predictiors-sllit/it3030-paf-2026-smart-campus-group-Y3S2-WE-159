"use client"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { MessageCircle } from "lucide-react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "../ui/empty"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { Spinner } from "../ui/spinner"
import { Textarea } from "../ui/textarea"
import { CommentCard } from "./commentCard"
import { LoadingData } from "./LoadingData"
import { Separator } from "../ui/separator"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
})

const ticketCommentSchema = z.object({
  comment: z.string().min(5, "Comment need to have at least 5 characters."),
})

type TicketCommentFormInput = z.input<typeof ticketCommentSchema>
type TicketCommentFormData = z.infer<typeof ticketCommentSchema>

interface Link {
  href: string
  method?: string | null
}
interface CommentLinks {
  ticket: Link
  self: Link
  add_comment: Link
}

interface CommentResponseData {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  text: string
  createdAt: string
  updatedAt: string
}

interface ApiResponseProps {
  data: CommentResponseData[]
  _links: CommentLinks
  status: string
  error: string | null
}

export const AddComments = ({ ticketId }: { ticketId: string }) => {
  const { theme, resolvedTheme } = useTheme() // for markdown editor
  const [isMounted, setIsMounted] = useState(false) // for markdown editor
  useEffect(() => {
    setIsMounted(true)
  }, []) // for markdown editor
  const colorMode =
    isMounted && (resolvedTheme ?? theme) === "dark"
      ? "dark"
      : isMounted
        ? "light"
        : undefined // for markdown editor

  // form initialize validation
  const form = useForm<TicketCommentFormInput, any, TicketCommentFormData>({
    resolver: zodResolver(ticketCommentSchema),
    mode: "onChange",
    defaultValues: {
      comment: "",
    },
  })

  const [comments, setComments] = useState<CommentResponseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/tickets/${encodeURIComponent(ticketId)}/comments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        const result: ApiResponseProps = await response.json()
        if (result.status === "success") {
          setComments(result.data)
        }
      } catch (error) {
        toast.warning("Something went wrong!")
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading)
    return (
      <div>
        <LoadingData />
      </div>
    )

  const onSubmit = async (values: TicketCommentFormData) => {
    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticketId)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: values.comment,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const result = await response.json()

      if (result.status === "success") {
        // Add new comment to the list
        setComments([...comments, result.data])
        // Reset form
        form.reset()
        toast.success("Comment posted successfully!")
      }
    } catch (error) {
      toast.error("Failed to post comment")
      console.error("Error posting comment:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div className="flex-1">
            <CardTitle>Comments & Discussion</CardTitle>
            <CardDescription>
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!loading && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  userName={comment.authorName}
                  comment={comment.text}
                />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircle />
                </EmptyMedia>
                <EmptyTitle>No Comments yet.</EmptyTitle>
                <EmptyDescription>
                  There is nothing to display here at the moment. Please check
                  back later or add a new comment.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Add Comment Form */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle>Add Comment</CardTitle>
          <CardDescription>
            Share your thoughts or provide an update about this ticket
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="comment"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  {isMounted ? (
                    <div
                      data-color-mode={colorMode}
                      className={`rounded-lg border p-5 ${
                        fieldState.invalid ? "border-destructive" : "border-border"
                      }`}
                    >
                      <MDEditor
                        value={field.value}
                        onChange={(val) => field.onChange(val || "")}
                        onBlur={field.onBlur}
                        height={250}
                        style={{ backgroundColor: "transparent" }}
                        preview="edit"
                        hideToolbar={false}
                        visibleDragbar={false}
                        previewOptions={{
                          style: { backgroundColor: "transparent" },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row gap-2 p-4">
                      <Spinner /> <span>Loading editor...</span>
                    </div>
                  )}
                  <Textarea
                    {...field}
                    id="ticket_comment_content"
                    className="hidden"
                    readOnly
                  />
                  {fieldState.invalid && (
                    <div className="mt-2">
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                Post Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
