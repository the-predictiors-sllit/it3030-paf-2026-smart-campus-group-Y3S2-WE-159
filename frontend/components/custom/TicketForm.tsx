"use client"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileWithPreview } from "@/hooks/use-file-upload"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Spinner } from "../ui/spinner"
import { Textarea } from "../ui/textarea"
import { ImageUpload } from "./ImageUpload"

// for markdown editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
})
// -------------------------------------------------------

//Form validation
const ticketSchema = z.object({
  location: z.string().min(0),
  category: z.enum(
    ["OTHER", "ELECTRICAL", "PLUMBING", "SOFTWARE", "HARDWARE"],
    {
      message: "Please select a category level",
    }
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "Please select a priority level",
  }),
  description: z
    .string()
    .min(10, "Please provide a description that had more than 10 characters."),
  contactPhone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must only contain numbers"),
})

type TicketFormInput = z.input<typeof ticketSchema>
type TicketFormData = z.infer<typeof ticketSchema>
// ------------------------------------------------------

export const TicketForm = ({ resourceId }: { resourceId: string }) => {
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

  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]) // for image upload part (template) and get the list of image objects
  const router = useRouter()

  // form initialize validation
  const form = useForm<TicketFormInput, any, TicketFormData>({
    resolver: zodResolver(ticketSchema),
    mode: "onChange",
    defaultValues: {
      location: "",
      category: "HARDWARE",
      priority: "LOW",
      description: "",
      contactPhone: "",
    },
  })

  const onSubmit = async (values: TicketFormData) => {
    const uploadedNames: string[] = []

    try {
      try {
        for (const imageFile of imageFiles) {
          const formData = new FormData()

          const rawFile = imageFile.file

          // upload image one at a time.
          if (rawFile instanceof File) {
            formData.append("file", rawFile)
            formData.append("folder", "tickets")
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Upload failed: ${errorText}`)
            }

            const result = await response.json()
            if (result.status === "success") {
              const fileName = result.data.generatedFileName
              uploadedNames.push(fileName) //Add imageId to the list.
              // console.log(`Success: ${fileName}`);
            }
          }
        }
      } catch (error) {
        console.error("Attachment Upload Error :", error)
      }

      // getting all the data to one place
      const payload = {
        resourceId: resourceId,
        location: values.location,
        category: values.category,
        priority: values.priority,
        description: values.description,
        contactPhone: values.contactPhone,
        attachments: uploadedNames,
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = "Failed to create ticket."

        try {
          const errorBody = await response.json()
          message = errorBody?.error?.message || message
        } catch {
          // Keep fallback message when response body is not JSON.
        }

        throw new Error(message)
      }

      toast.success("Ticket created successfully!")

      router.push("/tickets")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating a ticket"
      toast.error(message)
      console.error(error)
    }
  }

  return (
    <main>
      {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
      <FieldGroup>
        <FieldSet>
          <FieldTitle className="text-2xl">Incident Report Form</FieldTitle>
          <FieldDescription>
            Please provide the details of the incident below.
          </FieldDescription>

          <Field>
            <FieldLabel htmlFor="ticket_attachments">Attach Images</FieldLabel>
            {/* Image upload */}
            <ImageUpload
              onFilesChange={(files) => {
                setImageFiles(files)
                console.log("Files currently in parent state:", files)
              }}
            />
          </Field>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Controller
                  name="location"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ticket_location">
                        Location
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="ticket_location"
                        placeholder="Enter the building or room number"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>
              <Field>
                <Controller
                  name="contactPhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ticket_mobile">
                        Mobile Number
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="ticket_mobile"
                        placeholder="e.g., 0701230123"
                        inputMode="numeric" // open numeric keypad on mobile
                        onChange={(e) => {
                          // Replace any character that is NOT a digit with an empty string
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>
              <Field>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ticket_description">
                        Description
                      </FieldLabel>
                      <Card
                        data-color-mode={colorMode}
                        className={`rounded-lg  p-2 ring-2 ${
                          fieldState.invalid ? "ring-2 ring-destructive" : ""
                        }`}
                      >
                        {isMounted ? (
                          <MDEditor
                            value={field.value}
                            onChange={(val) => field.onChange(val || "")}
                            onBlur={field.onBlur}
                            height={400}
                            style={{
                              backgroundColor: "var(--color-card)", 
                            }}
                            previewOptions={{
                              style: { backgroundColor: "transparent" },
                            }}
                          />
                        ) : (
                          <div className="flex flex-row gap-2">
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
                      </Card>
                    </Field>
                  )}
                />
              </Field>
              <Field>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ticket_category">
                        Category
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          id="ticket_category"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="HARDWARE">
                              Hardware Issues
                            </SelectItem>
                            <SelectItem value="SOFTWARE">
                              Software Issues
                            </SelectItem>
                            <SelectItem value="ELECTRICAL">
                              Electrical Issues
                            </SelectItem>
                            <SelectItem value="PLUMBING">
                              Plumbing Issues
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>
              <Field>
                <Controller
                  name="priority"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ticket_priority">
                        Priority Level
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          id="ticket_priority"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>

              <FieldSeparator />
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                {/* <Button variant="outline" type="button">
              Cancel
            </Button> */}
              </Field>
            </FieldGroup>
          </form>
        </FieldSet>
      </FieldGroup>
    </main>
  )
}
