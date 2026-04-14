"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "../ui/card"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { Controller, useForm } from "react-hook-form"
import dynamic from "next/dynamic"
import { Spinner } from "../ui/spinner"
import { Textarea } from "../ui/textarea"
import * as z from "zod"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import MarkdownPreview from "./MarkdownPreview"
import { CommentCard } from "./commentCard"
import { toast } from "sonner"
import { LoadingData } from "./LoadingData"
import { EmptyData } from "./EmptyData"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"
import { IconMessage2Question } from "@tabler/icons-react"


const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
})

const ticketCommentSchema = z.object({
    comment: z.string().min(5, "Comment need to have at least 5 characters."),
})

type TicketCommentFormInput = z.input<typeof ticketCommentSchema>;
type TicketCommentFormData = z.infer<typeof ticketCommentSchema>;

interface Link {
    href: string;
    method?: string | null
}
interface CommentLinks {
    ticket: Link;
    self: Link;
    add_comment: Link;
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
    status: string;
    error: string | null;
}


export const AddComments = ({ ticketId }: { ticketId: string }) => {
    const { theme, resolvedTheme } = useTheme(); // for markdown editor
    const [isMounted, setIsMounted] = useState(false)// for markdown editor
    useEffect(() => {
        setIsMounted(true)
    }, [])// for markdown editor
    const colorMode =
        isMounted && (resolvedTheme ?? theme) === "dark" ? "dark" : isMounted ? "light" : undefined// for markdown editor

    // form initialize validation 
    const form = useForm<TicketCommentFormInput, any, TicketCommentFormData>({
        resolver: zodResolver(ticketCommentSchema),
        mode: "onChange",
        defaultValues: {
            comment: "",
        },
    })


    const [comments, setComments] = useState<CommentResponseData[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}/comments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                const result: ApiResponseProps = await response.json();
                if (result.status === "success") {
                    setComments(result.data);
                }

            } catch (error) {
                toast.warning("Something went wrong!")
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);


    if (loading) return <div><LoadingData /></div>;

    const onSubmit = async (values: TicketCommentFormData) => { }




    return (
        <div className=" flex flex-col h-full justify-between gap-4">

            <div className="mx-auto mb-auto w-full overflow-auto ">
                {!loading && comments.length > 0 ? (
                    <div>

                        {
                            comments.map((comment) => (
                                <CommentCard key={comment.id} userName={comment.authorName} comment={comment.text} />
                            ))
                        }
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <IconMessage2Question />
                            </EmptyMedia>
                            <EmptyTitle>No Comments yet.</EmptyTitle>
                            <EmptyDescription>
                                There is nothing to display here at the moment. Please check back later or add a new comment.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

            </div>


            <form onSubmit={form.handleSubmit(onSubmit)}>

                <Field >
                    <Controller
                        name="comment"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <Card
                                    data-color-mode={colorMode}
                                    className={`p-2 bg-primary-foreground rounded-lg ring-2 ${fieldState.invalid ? "ring-destructive ring-2" : ""
                                        }`}
                                >
                                    <FieldLabel htmlFor="ticket_description">
                                        Add Comment
                                    </FieldLabel>
                                    {isMounted ? (
                                        <MDEditor
                                            value={field.value}
                                            onChange={(val) => field.onChange(val || "")}
                                            onBlur={field.onBlur}
                                            height={300}
                                            style={{ backgroundColor: "--color-accent-foreground" }}
                                            previewOptions={{ style: { backgroundColor: "transparent" } }}
                                        />
                                    ) : (<div className="flex flex-row gap-2">
                                        <Spinner /> <span>Loading..</span>
                                    </div>

                                    )}
                                    <Textarea
                                        {...field}
                                        id="ticket_description"
                                        className="hidden"
                                        readOnly
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    <Button type="submit">Submit</Button>
                                </Card>
                            </Field>
                        )}
                    />
                </Field>
            </form>
        </div>
    )
}