"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// form validation
const bookingSchema = z.object({
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expectedAttendees: z.coerce.number().int().min(0, "Must be 0 or more"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
})

type BookingFormInput = z.input<typeof bookingSchema>
type BookingFormData = z.infer<typeof bookingSchema>

const PURPOSE_CHIPS = [
  "Group Meeting",
  "Workshop",
  "Presentation",
  "Lab Viva",
  "Lab Exam",
  "Other",
]

export const BookingForm = ({ id }: { id: string }) => {
  const [startDateOpen, setStartDateOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDateOpen, setEndDateOpen] = React.useState(false)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [activeChip, setActiveChip] = React.useState<string | null>(null)
  const router = useRouter()

  const form = useForm<BookingFormInput, any, BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "",
      expectedAttendees: 0,
      startTime: "10:30",
      endTime: "11:30",
    },
  })

  const handleChipClick = (chip: string) => {
    setActiveChip(chip)
    form.setValue("purpose", chip, { shouldValidate: true })
  }

  const onSubmit = async (values: BookingFormData) => {
    try {
      // convert date and time to date time
      const combineDateTime = (date: Date, time: string) => {
        const d = new Date(date)
        const [hours, minutes, seconds] = time.split(":")
        d.setHours(
          parseInt(hours),
          parseInt(minutes),
          seconds ? parseInt(seconds) : 0,
          0
        )
        return format(d, "yyyy-MM-dd'T'HH:mm:ss")
      }

      // to show error is there is no start date and end data
      if (!startDate || !endDate) {
        toast.warning("Submit failed: start or end date was missing")
        throw new Error("Data was null or missing")
      }

      const payload = {
        resourceId: id,
        purpose: values.purpose,
        expectedAttendees: values.expectedAttendees,
        startTime: combineDateTime(startDate, values.startTime),
        endTime: combineDateTime(endDate, values.endTime),
      }

      // api
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = "Failed to create booking"

        try {
          const errorBody = await response.json()
          message = errorBody?.error?.message || message
        } catch {
          // Keep fallback message when response body is not JSON.
        }

        // throw new Error(message);
      }

      toast.success("Booking created successfully!")

      router.push("/booking")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating booking"
      toast.error(message)
      console.error(error)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldTitle className="text-2xl">Reserve a Space</FieldTitle>
            <FieldDescription>
              Fill in the details below to confirm your reservation.
            </FieldDescription>
            {/* purpose */}
            <FieldGroup>
              <Field>
                <Controller
                  name="purpose"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="Booking_form_purpose_label">
                        Purpose
                      </FieldLabel>
                      <Textarea
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="Booking_form_purpose_input"
                        placeholder="Insert the purpose."
                        className="resize-none"
                        required
                      />
                      <div className=" flex flex-wrap gap-[7px]">
                        {PURPOSE_CHIPS.map((chip) => (
                          <Button
                            key={chip}
                            type="button"
                            onClick={() => handleChipClick(chip)}
                            variant={`${activeChip === chip ? "default" : "outline"}`}
                            className="rounded-full cursor-pointer"
                          >
                            <span className="text-xs">{chip}</span>
                          </Button>
                        ))}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>

              {/* Attendees */}

              <Field>
                <Controller
                  name="expectedAttendees"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="Booking_form_attendees_label">
                        Expected Attendees
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value as number | string}
                        aria-invalid={fieldState.invalid}
                        id="Booking_form_attendees_input"
                        type="number"
                      />
                      <FieldDescription className="text-xs">
                        Set to 0 if there are no attendees.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>

              {/* Start time */}

              <FieldGroup className="mx-auto flex-row">
                <Field>
                  <FieldLabel htmlFor="date-picker-optional">
                    Start Date
                  </FieldLabel>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker-optional"
                        className="w-32 justify-between font-normal"
                      >
                        {startDate ? format(startDate, "PPP") : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        defaultMonth={startDate}
                        onSelect={(date) => {
                          setStartDate(date)
                          setStartDateOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field className="w-32">
                  <Controller
                    name="startTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="time-picker-optional">
                          Start Time
                        </FieldLabel>
                        <Input
                          {...field}
                          type="time"
                          id="time-picker-optional"
                          step="60"
                          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </Field>
              </FieldGroup>

              {/* End time */}

              <FieldGroup className="mx-auto flex-row">
                <Field>
                  <FieldLabel htmlFor="date-picker-optional">
                    End Date
                  </FieldLabel>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker-optional"
                        className="w-32 justify-between font-normal"
                      >
                        {endDate ? format(endDate, "PPP") : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        defaultMonth={endDate}
                        onSelect={(date) => {
                          setEndDate(date)
                          setEndDateOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field className="w-32">
                  <Controller
                    name="endTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="time-picker-optional">
                          End Time
                        </FieldLabel>
                        <Input
                          {...field}
                          type="time"
                          id="time-picker-optional"
                          step="60"
                          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </Field>
              </FieldGroup>
            </FieldGroup>
          </FieldSet>
          {/* <FieldSeparator /> */}
          <Field orientation="horizontal">
            <Button type="submit" className="w-full">
              Submit
            </Button>
            {/* <Button variant="outline" type="button">
              Cancel
            </Button> */}
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

// "use client"

// import * as React from "react"
// import { format } from "date-fns"
// import { useForm, Controller } from "react-hook-form"
// import * as z from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Card } from "../ui/card"

// // ─── Validation ───────────────────────────────────────────────────────────────

// const bookingSchema = z.object({
//   purpose: z.string().min(5, "Purpose must be at least 5 characters"),
//   expectedAttendees: z.coerce.number().int().min(0, "Must be 0 or more"),
//   startTime: z.string().min(1, "Start time is required"),
//   endTime: z.string().min(1, "End time is required"),
// })

// type BookingFormInput = z.input<typeof bookingSchema>
// type BookingFormData = z.infer<typeof bookingSchema>

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PURPOSE_CHIPS = ["Group Meeting", "Workshop", "Presentation", "Lab Viva","Lab Exam", "Other"]

// // ─── Icons ────────────────────────────────────────────────────────────────────

// const CalendarIcon = () => (
//   <svg
//     width="15" height="15" viewBox="0 0 16 16" fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     className="flex-shrink-0 opacity-55"
//   >
//     <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="#6e6258" strokeWidth="1.3" />
//     <path d="M1.5 6.5h13" stroke="#6e6258" strokeWidth="1.3" />
//     <path d="M5 1.5v3M11 1.5v3" stroke="#6e6258" strokeWidth="1.3" strokeLinecap="round" />
//     <rect x="4" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
//     <rect x="7" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
//     <rect x="10" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
//   </svg>
// )

// const ArrowIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M3 10h14M10 4l7 6-7 6"
//       stroke="#e8e0d5" strokeWidth="1.8"
//       strokeLinecap="round" strokeLinejoin="round"
//     />
//   </svg>
// )

// // ─── Sub-components ───────────────────────────────────────────────────────────

// const FieldLabel = ({ children }: { children: React.ReactNode }) => (
//   <p className="mb-[7px] text-[11px] font-medium uppercase tracking-[0.1em] text-[#8a8278]">
//     {children}
//   </p>
// )

// const SectionDivider = ({ children }: { children: React.ReactNode }) => (
//   <div className="flex items-center gap-[10px] mt-[1.4rem] mb-[0.75rem]">
//     <span className="w-[14px] h-px bg-[#a09080] opacity-60 flex-shrink-0" />
//     <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#a09080] whitespace-nowrap">
//       {children}
//     </p>
//     <span className="flex-1 h-px bg-[#d4cec8]" />
//   </div>
// )

// // ─── DatePickerButton ─────────────────────────────────────────────────────────

// interface DatePickerButtonProps {
//   value: Date | undefined
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onSelect: (date: Date | undefined) => void
// }

// const DatePickerButton = ({ value, open, onOpenChange, onSelect }: DatePickerButtonProps) => (
//   <Popover open={open} onOpenChange={onOpenChange}>
//     <PopoverTrigger asChild>
//       <button
//         type="button"
//         className={[
//           "flex w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#b8afa6] bg-[#fff8f2]",
//           "px-[13px] py-[10px] text-[13.5px] font-medium",
//           "shadow-[0_1px_3px_rgba(100,88,76,0.10)] transition",
//           "hover:border-[#8a7e74] hover:bg-[#fff4ec] hover:shadow-[0_2px_8px_rgba(100,88,76,0.14)]",
//           value ? "text-[#2c2820]" : "text-[#6e6258]",
//         ].join(" ")}
//       >
//         <span>{value ? format(value, "MMM d, yyyy") : "Select date"}</span>
//         <CalendarIcon />
//       </button>
//     </PopoverTrigger>
//     {/* align="start" anchors the popover below the trigger button,
//         preventing it from jumping to the top-left corner of the viewport */}
//     <PopoverContent className="w-auto overflow-hidden p-0" align="start">
//       <Calendar
//         mode="single"
//         selected={value}
//         defaultMonth={value}
//         captionLayout="dropdown"
//         onSelect={(date) => {
//           onSelect(date)
//           onOpenChange(false)
//         }}
//       />
//     </PopoverContent>
//   </Popover>
// )

// // ─── Main Component ───────────────────────────────────────────────────────────

// export const BookingForm = ({ id }: { id: string }) => {
//   const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
//   const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
//   const [startOpen, setStartOpen] = React.useState(false)
//   const [endOpen, setEndOpen] = React.useState(false)
//   const [activeChip, setActiveChip] = React.useState<string | null>(null)
//   const router = useRouter()

//   const form = useForm<BookingFormInput, any, BookingFormData>({
//     resolver: zodResolver(bookingSchema),
//     mode: "onChange",
//     defaultValues: {
//       purpose: "",
//       expectedAttendees: 0,
//       startTime: "10:30",
//       endTime: "11:30",
//     },
//   })

//   const onSubmit = async (values: BookingFormData) => {
//     try {
//       const combineDateTime = (date: Date, time: string) => {
//         const d = new Date(date)
//         const [hours, minutes, seconds] = time.split(":")
//         d.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0, 0)
//         return format(d, "yyyy-MM-dd'T'HH:mm:ss")
//       }

//       if (!startDate || !endDate) {
//         toast.warning("Submit failed: start or end date was missing")
//         throw new Error("Date was null or missing")
//       }

//       const payload = {
//         resourceId: id,
//         purpose: values.purpose,
//         expectedAttendees: values.expectedAttendees,
//         startTime: combineDateTime(startDate, values.startTime),
//         endTime: combineDateTime(endDate, values.endTime),
//       }

//       const response = await fetch("/api/bookings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       })

//       if (!response.ok) {
//         let message = "Failed to create booking"
//         try {
//           const errorBody = await response.json()
//           message = errorBody?.error?.message || message
//         } catch {}
//         toast.error(message)
//         return
//       }

//       toast.success("Booking created successfully!")
//       router.push("/booking")
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Error creating booking"
//       toast.error(message)
//       console.error(error)
//     }
//   }

//   const handleChipClick = (chip: string) => {
//     setActiveChip(chip)
//     form.setValue("purpose", chip, { shouldValidate: true })
//   }

//   return (
//     <div className="flex  items-center justify-center rounded-2xl relative overflow-hidden">

//       {/* Card */}
//       <Card>
//         {/* Header */}
//         <div >
//           <p className="mb-[2px] text-[10.5px] font-medium uppercase tracking-[0.2em]  flex items-center gap-[6px]">
//             <span className="inline-block w-[5px] h-[5px] rounded-full bg-primary" />
//             Reserve a space
//           </p>
//           <h1 className=" text-[30px] font-semibold tracking-tight  leading-[1.15] mb-[6px]">
//             Booking Form
//           </h1>
//           <p className="text-[13px] leading-[1.5]">
//             Fill in the details below to confirm your reservation.
//           </p>
//         </div>

//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

//           {/* ── Purpose ── */}
//           <Controller
//             name="purpose"
//             control={form.control}
//             render={({ field, fieldState }) => (
//               <div>
//                 <FieldLabel>Purpose</FieldLabel>
//                 <textarea
//                   {...field}
//                   placeholder="Describe the purpose of your booking…"
//                   rows={3}
//                   onChange={(e) => {
//                     field.onChange(e)
//                     setActiveChip(null)
//                   }}
//                   className="w-full resize-none rounded-[10px] px-[13px] py-[10px] text-[14px] placeholder:text-[#b8b0a8] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10"
//                 />
//                 <div className="mt-2 flex flex-wrap gap-[7px]">
//                   {PURPOSE_CHIPS.map((chip) => (
//                     <button
//                       key={chip}
//                       type="button"
//                       onClick={() => handleChipClick(chip)}
//                       className={[
//                         "rounded-full border-[1.5px] px-[13px] py-[5px] text-[12px] font-medium transition shadow-[0_1px_3px_rgba(100,88,76,0.09)]",
//                         activeChip === chip
//                           ? "border-[#3a3028] bg-[#3a3028] text-[#e8e0d5] shadow-[0_2px_8px_rgba(40,32,24,0.18)]"
//                           : "border-[#b8afa6] bg-[#fff8f2] text-[#5a5048] hover:border-[#8a7e74] hover:bg-[#f0e8e0] hover:text-[#2c2820] hover:shadow-[0_2px_6px_rgba(100,88,76,0.13)]",
//                       ].join(" ")}
//                     >
//                       {chip}
//                     </button>
//                   ))}
//                 </div>
//                 {fieldState.invalid && (
//                   <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
//                 )}
//               </div>
//             )}
//           />

//           {/* ── Expected Attendees ── */}
//           <Controller
//             name="expectedAttendees"
//             control={form.control}
//             render={({ field, fieldState }) => (
//               <div>
//                 <FieldLabel>Expected attendees</FieldLabel>
//                 <div className="flex items-center overflow-hidden rounded-[10px] border-[1.5px] border-[#b8afa6] bg-[#fff8f2] shadow-[0_1px_3px_rgba(100,88,76,0.09)] w-fit">
//                   <button
//                     type="button"
//                     onClick={() => field.onChange(Math.max(0, (field.value as number) - 1))}
//                     className="flex h-10 w-10 items-center justify-center text-[17px] text-[#6e6258] transition hover:bg-[#f0e8e0] hover:text-[#2c2820]"
//                   >
//                     −
//                   </button>
//                   <span className="h-[22px] w-px bg-[#cdc7c0]" />
//                   <span className="min-w-[36px] text-center text-[15px] font-medium text-[#2c2820]">
//                     {field.value as number}
//                   </span>
//                   <span className="h-[22px] w-px bg-[#cdc7c0]" />
//                   <button
//                     type="button"
//                     onClick={() => field.onChange((field.value as number) + 1)}
//                     className="flex h-10 w-10 items-center justify-center text-[17px] text-[#6e6258] transition hover:bg-[#f0e8e0] hover:text-[#2c2820]"
//                   >
//                     +
//                   </button>
//                 </div>
//                 <p className="mt-[5px] text-[11.5px] text-[#b8b0a8]">Set to 0 if there are no attendees.</p>
//                 {fieldState.invalid && (
//                   <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
//                 )}
//               </div>
//             )}
//           />

//           {/* ── Start ── */}
//           <div>
//             <SectionDivider>Start</SectionDivider>
//             <div className="grid grid-cols-2 gap-[10px]">
//               <div>
//                 <FieldLabel>Date</FieldLabel>
//                 <DatePickerButton
//                   value={startDate}
//                   open={startOpen}
//                   onOpenChange={setStartOpen}
//                   onSelect={setStartDate}
//                 />
//               </div>
//               <Controller
//                 name="startTime"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <div>
//                     <FieldLabel>Time</FieldLabel>
//                     <input
//                       {...field}
//                       type="time"
//                       step="60"
//                       className="w-full rounded-[10px] border border-[#cdc7c0] bg-[#ebe7e2] px-[13px] py-[10px] text-[14px] text-[#2c2820] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10 [color-scheme:light]"
//                     />
//                     {fieldState.invalid && (
//                       <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>
//           </div>

//           {/* ── End ── */}
//           <div>
//             <SectionDivider>End</SectionDivider>
//             <div className="grid grid-cols-2 gap-[10px]">
//               <div>
//                 <FieldLabel>Date</FieldLabel>
//                 <DatePickerButton
//                   value={endDate}
//                   open={endOpen}
//                   onOpenChange={setEndOpen}
//                   onSelect={setEndDate}
//                 />
//               </div>
//               <Controller
//                 name="endTime"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <div>
//                     <FieldLabel>Time</FieldLabel>
//                     <input
//                       {...field}
//                       type="time"
//                       step="60"
//                       className="w-full rounded-[10px] border border-[#cdc7c0] bg-[#ebe7e2] px-[13px] py-[10px] text-[14px] text-[#2c2820] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10 [color-scheme:light]"
//                     />
//                     {fieldState.invalid && (
//                       <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>
//           </div>

//           {/* ── Submit ── */}
//           <button
//             type="submit"
//             className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3a3028] px-4 py-[14px] text-[14.5px] font-medium tracking-[0.04em] text-[#e8e0d5] shadow-[0_4px_16px_rgba(40,32,24,0.18)] transition hover:bg-[#2c2820] active:scale-[0.98]"
//           >
//             <ArrowIcon />
//             Confirm booking
//           </button>

//         </form>
//       </Card>
//     </div>
//   )
// }
