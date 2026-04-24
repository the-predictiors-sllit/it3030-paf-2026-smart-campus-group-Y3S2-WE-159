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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  nickname: z.string().optional(),
})

type ProfileFormInput = z.input<typeof profileSchema>
type ProfileFormData = z.infer<typeof profileSchema>

export const ManageUserEditProfile = ({
  user,
  token,
  onUpdateSuccessAction,
}: {
  user?: any
  token?: string
  onUpdateSuccessAction?: () => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)
  const form = useForm<ProfileFormInput, any, ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      given_name: user?.given_name || "",
      family_name: user?.family_name || "",
      nickname: user?.nickname || "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        given_name: user.given_name || "",
        family_name: user.family_name || "",
        nickname: user.nickname || "",
      })
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormData) => {
    if (!user || (!user.user_id && !user.id)) return
    setLoading(true)

    // Build payload, keeping undefined out where unnecessary
    const payload: any = {
      name: values.name,
    }

    if (values.given_name && values.given_name.trim() !== "") {
      payload.given_name = values.given_name
    } else if (user.given_name) {
      payload.given_name = null // Unset the attribute
    }

    if (values.family_name && values.family_name.trim() !== "") {
      payload.family_name = values.family_name
    } else if (user.family_name) {
      payload.family_name = null
    }

    if (values.nickname && values.nickname.trim() !== "") {
      payload.nickname = values.nickname
    } else if (user.nickname) {
      payload.nickname = null
    }

    try {
      const response = await fetch(`/api/auth0/management/users/${encodeURIComponent(user.user_id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        if (onUpdateSuccessAction) {
          await onUpdateSuccessAction()
        }
      } else {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: `HTTP ${response.status} - ${response.statusText}` }
        }
        toast.error("Error! Cannot update user profile.")
        throw new Error(errorData.message || "Failed to update user profile.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
      console.log(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-sm">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to {user?.name || "the user"}&apos;s profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-name"
                      placeholder="Full Name"
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
                name="given_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-givenName">Given Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-givenName"
                      placeholder="First Name"
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
                name="family_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-familyName">Family Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-familyName"
                      placeholder="Last Name"
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
                name="nickname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-nickname">Nickname</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-nickname"
                      placeholder="Nickname"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </div>
      </form>
    </DialogContent>
  )
}
