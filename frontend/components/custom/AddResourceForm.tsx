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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Spinner } from "../ui/spinner"
import { Textarea } from "../ui/textarea"
import { ImageUpload } from "./ImageUpload"

// Form validation schema
const resourceSchema = z.object({
    name: z.string()
        .min(1, "Resource name is required")
        .min(3, "Name must be at least 3 characters"),
    type: z.enum(["ROOM", "LAB", "EQUIPMENT"], {
        message: "Please select a valid resource type"
    }),
    capacity: z.string()
        .optional()
        .refine((val) => !val || /^\d+$/.test(val), "Capacity must be a valid number")
        .transform((val) => val ? parseInt(val) : undefined),
    location: z.string()
        .min(1, "Location is required")
        .min(3, "Location must be at least 3 characters"),
    status: z.enum(["ACTIVE", "OUT_OF_SERVICE"], {
        message: "Please select a valid status"
    }),
    description: z.string()
        .optional()
        .transform((val) => val || undefined),
})

type ResourceFormInput = z.input<typeof resourceSchema>;
type ResourceFormData = z.infer<typeof resourceSchema>;

export const AddResourceForm = () => {
    const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();

    // Form initialization with validation
    const form = useForm<ResourceFormInput, any, ResourceFormData>({
        resolver: zodResolver(resourceSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            type: "ROOM",
            capacity: "",
            location: "",
            status: "ACTIVE",
            description: "",
        },
    })

    const onSubmit = async (values: ResourceFormData) => {
        setIsLoading(true)
        let uploadedImageUrl: string | undefined;

        try {
            // Upload image if provided
            if (imageFiles.length > 0) {
                const imageFile = imageFiles[0]; // Only one image per resource
                const formData = new FormData();

                if (imageFile.file instanceof File) {
                    formData.append("file", imageFile.file);
                    formData.append("folder", "resources");

                    try {
                        const uploadResponse = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                        })

                        if (!uploadResponse.ok) {
                            const errorText = await uploadResponse.text();
                            throw new Error(`Image upload failed: ${errorText}`);
                        }

                        const uploadResult = await uploadResponse.json();
                        if (uploadResult.status === "success") {
                            uploadedImageUrl = uploadResult.data.generatedFileName;
                        }
                    } catch (error) {
                        console.error("Image Upload Error:", error)
                        toast.error("Failed to upload image");
                        setIsLoading(false)
                        return;
                    }
                }
            }

            // Prepare resource data
            const payload = {
                name: values.name,
                type: values.type,
                capacity: values.capacity || null,
                location: values.location,
                status: values.status,
                description: values.description || null,
                imageUrl: uploadedImageUrl || null,
            }

            // Submit resource to backend
            const response = await fetch('/api/resources', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error?.message || "Failed to create resource");
                setIsLoading(false)
                return;
            }

            toast.success("Resource created successfully!");
            form.reset();
            setImageFiles([]);
            
            // Redirect to view resources page after a short delay
            setTimeout(() => {
                router.push("/admin/resources/viewResources");
            }, 1000);

        } catch (error) {
            console.error("Error:", error)
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="border border-border/50 shadow-lg">
                <div className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Add New Resource</h1>
                        <p className="text-muted-foreground mt-2">Create a new resource that can be booked by users</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <FieldSet>
                                <FieldLegend>Basic Information</FieldLegend>
                                <FieldDescription>
                                    Enter the basic details about the resource
                                </FieldDescription>
                                <FieldSeparator className="my-4" />

                                <FieldGroup>
                                    <FieldLabel htmlFor="name">Resource Name *</FieldLabel>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Main Lecture Hall A"
                                        {...form.register("name")}
                                        disabled={isLoading}
                                    />
                                    {form.formState.errors.name && (
                                        <FieldError>{form.formState.errors.name.message}</FieldError>
                                    )}
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel htmlFor="type">Resource Type *</FieldLabel>
                                    <Controller
                                        name="type"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                <SelectTrigger id="type">
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="ROOM">Room</SelectItem>
                                                        <SelectItem value="LAB">Lab</SelectItem>
                                                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.type && (
                                        <FieldError>{form.formState.errors.type.message}</FieldError>
                                    )}
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel htmlFor="location">Location *</FieldLabel>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Building 1, Floor 2"
                                        {...form.register("location")}
                                        disabled={isLoading}
                                    />
                                    {form.formState.errors.location && (
                                        <FieldError>{form.formState.errors.location.message}</FieldError>
                                    )}
                                </FieldGroup>
                            </FieldSet>
                        </div>

                        {/* Resource Details Section */}
                        <div className="space-y-6">
                            <FieldSet>
                                <FieldLegend>Resource Details</FieldLegend>
                                <FieldDescription>
                                    Provide additional details about the resource
                                </FieldDescription>
                                <FieldSeparator className="my-4" />

                                <FieldGroup>
                                    <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="e.g., 150"
                                        {...form.register("capacity")}
                                        disabled={isLoading}
                                    />
                                    <FieldDescription>
                                        Number of people the resource can accommodate (optional)
                                    </FieldDescription>
                                    {form.formState.errors.capacity && (
                                        <FieldError>{form.formState.errors.capacity.message}</FieldError>
                                    )}
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel htmlFor="status">Status *</FieldLabel>
                                    <Controller
                                        name="status"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.status && (
                                        <FieldError>{form.formState.errors.status.message}</FieldError>
                                    )}
                                </FieldGroup>

                                <FieldGroup>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea
                                        id="description"
                                        placeholder="Provide a detailed description of the resource..."
                                        {...form.register("description")}
                                        disabled={isLoading}
                                        rows={4}
                                    />
                                    <FieldDescription>
                                        Optional description for additional context
                                    </FieldDescription>
                                    {form.formState.errors.description && (
                                        <FieldError>{form.formState.errors.description.message}</FieldError>
                                    )}
                                </FieldGroup>
                            </FieldSet>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-6">
                            <FieldSet>
                                <FieldLegend>Resource Image</FieldLegend>
                                <FieldDescription>
                                    Upload a single image of the resource
                                </FieldDescription>
                                <FieldSeparator className="my-4" />

                                <ImageUpload
                                    maxFiles={1}
                                    maxSize={5 * 1024 * 1024} // 5MB
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    multiple={false}
                                    onFilesChange={(files) => setImageFiles(files)}
                                />
                            </FieldSet>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 justify-end pt-6 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !form.formState.isValid}
                                className="gap-2"
                            >
                                {isLoading && <Spinner className="h-4 w-4" />}
                                {isLoading ? "Creating..." : "Create Resource"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    )
}
