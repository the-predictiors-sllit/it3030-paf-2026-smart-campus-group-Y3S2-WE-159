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
import { Label } from "@/components/ui/label"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Auth0ErrorProp } from "@/lib/Auth0ErrorPrope"
import { useState } from "react"

// ------------------------------
// password generator

const generateSecurePassword = (length = 12): string => {
  const charset = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    // symbol: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    symbol: "!@#$%&",
  }

  const allChars = Object.values(charset).join("")
  let password = ""

  password += charset.upper[Math.floor(Math.random() * charset.upper.length)]
  password += charset.lower[Math.floor(Math.random() * charset.lower.length)]
  password += charset.number[Math.floor(Math.random() * charset.number.length)]
  password += charset.symbol[Math.floor(Math.random() * charset.symbol.length)]

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

// form validation
const userSchema = z.object({
  email: z.email({ pattern: z.regexes.email }),

  // username: z
  //   .string()
  //   .min(3, "Username must be at least 3 characters")
  //   .max(20, "Username cannot exceed 20 characters")
  //   .regex(
  //     /^[a-zA-Z0-9_]+$/,
  //     "Username can only contain letters, numbers, and underscores"
  //   ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
})

type userFormInput = z.input<typeof userSchema>
type userFormData = z.infer<typeof userSchema>

export const ManageUserAddNew = ({ onCreateSuccess }: any) => {
  const [error, setError] = useState<Auth0ErrorProp | null>(null)
  const form = useForm<userFormInput, any, userFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    resetOptions: {
      keepValues: false,
    },
    defaultValues: {
      email: "",
      // username: "",
      password: generateSecurePassword(),
    },
  })

  const onSubmit = async (values: userFormData) => {
    const payload = {
      email: values.email,
      // username:values.username,
      password: values.password,
      connection: "Username-Password-Authentication",
    }
    const formData = new FormData()
    try {
      const response = await fetch(`/api/auth0/management/users`, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (response.status == 204 && response.ok) {
        toast.success("User added successfully")
        await onCreateSuccess()
      } else {
        const errorData: Auth0ErrorProp = await response.json()
        setError(errorData)
        toast.error("Error! Can not create user.")
        throw new Error(errorData.message || "Failed to create user.")
      }
    } catch (err) {
      toast.error(error?.message || "An error occurred")
      console.log(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <DialogContent className="sm:max-w-sm">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Insert user details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ticket_location">Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="ticket_location"
                      placeholder="Enter user Email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>
            {/* <Field>
            <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="ticket_location">User Name</FieldLabel>
              <Input
              {...field}
              aria-invalid={fieldState.invalid}
              id="ticket_location"
              placeholder="Enter user name"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
                )}
                </Field>
                )}
                />
                </Field> */}
            <Field>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ticket_location">
                      Mobile Number
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="ticket_location"
                      placeholder="Enter password"
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
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </div>
      </form>
    </DialogContent>
  )
}
