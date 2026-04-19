"use client"

import * as React from "react"
import { format } from "date-fns"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ─── Validation ───────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expectedAttendees: z.coerce.number().int().min(0, "Must be 0 or more"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
})

type BookingFormInput = z.input<typeof bookingSchema>
type BookingFormData = z.infer<typeof bookingSchema>

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPOSE_CHIPS = ["Group Meeting", "Workshop", "Presentation", "Lab Viva","Lab Exam", "Other"]

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg
    width="15" height="15" viewBox="0 0 16 16" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0 opacity-55"
  >
    <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="#6e6258" strokeWidth="1.3" />
    <path d="M1.5 6.5h13" stroke="#6e6258" strokeWidth="1.3" />
    <path d="M5 1.5v3M11 1.5v3" stroke="#6e6258" strokeWidth="1.3" strokeLinecap="round" />
    <rect x="4" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
    <rect x="7" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
    <rect x="10" y="9" width="2" height="2" rx="0.4" fill="#6e6258" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 10h14M10 4l7 6-7 6"
      stroke="#e8e0d5" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-[7px] text-[11px] font-medium uppercase tracking-[0.1em] text-[#8a8278]">
    {children}
  </p>
)

const SectionDivider = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-[10px] mt-[1.4rem] mb-[0.75rem]">
    <span className="w-[14px] h-px bg-[#a09080] opacity-60 flex-shrink-0" />
    <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#a09080] whitespace-nowrap">
      {children}
    </p>
    <span className="flex-1 h-px bg-[#d4cec8]" />
  </div>
)

// ─── DatePickerButton ─────────────────────────────────────────────────────────

interface DatePickerButtonProps {
  value: Date | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (date: Date | undefined) => void
}

const DatePickerButton = ({ value, open, onOpenChange, onSelect }: DatePickerButtonProps) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <button
        type="button"
        className={[
          "flex w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#b8afa6] bg-[#fff8f2]",
          "px-[13px] py-[10px] text-[13.5px] font-medium",
          "shadow-[0_1px_3px_rgba(100,88,76,0.10)] transition",
          "hover:border-[#8a7e74] hover:bg-[#fff4ec] hover:shadow-[0_2px_8px_rgba(100,88,76,0.14)]",
          value ? "text-[#2c2820]" : "text-[#6e6258]",
        ].join(" ")}
      >
        <span>{value ? format(value, "MMM d, yyyy") : "Select date"}</span>
        <CalendarIcon />
      </button>
    </PopoverTrigger>
    {/* align="start" anchors the popover below the trigger button,
        preventing it from jumping to the top-left corner of the viewport */}
    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
      <Calendar
        mode="single"
        selected={value}
        defaultMonth={value}
        captionLayout="dropdown"
        onSelect={(date) => {
          onSelect(date)
          onOpenChange(false)
        }}
      />
    </PopoverContent>
  </Popover>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const BookingForm = ({ id }: { id: string }) => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [startOpen, setStartOpen] = React.useState(false)
  const [endOpen, setEndOpen] = React.useState(false)
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

  const onSubmit = async (values: BookingFormData) => {
    try {
      const combineDateTime = (date: Date, time: string) => {
        const d = new Date(date)
        const [hours, minutes, seconds] = time.split(":")
        d.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0, 0)
        return format(d, "yyyy-MM-dd'T'HH:mm:ss")
      }

      if (!startDate || !endDate) {
        toast.warning("Submit failed: start or end date was missing")
        throw new Error("Date was null or missing")
      }

      const payload = {
        resourceId: id,
        purpose: values.purpose,
        expectedAttendees: values.expectedAttendees,
        startTime: combineDateTime(startDate, values.startTime),
        endTime: combineDateTime(endDate, values.endTime),
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = "Failed to create booking"
        try {
          const errorBody = await response.json()
          message = errorBody?.error?.message || message
        } catch {}
        toast.error(message)
        return
      }

      toast.success("Booking created successfully!")
      router.push("/booking")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error creating booking"
      toast.error(message)
      console.error(error)
    }
  }

  const handleChipClick = (chip: string) => {
    setActiveChip(chip)
    form.setValue("purpose", chip, { shouldValidate: true })
  }

  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-2xl bg-[#e8e4df] p-10 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-28 -right-28 w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(180,170,158,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(160,150,138,0.12)_0%,transparent_70%)]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[20px] border border-[#d8d2cc] bg-[#f2eeea] px-8 py-10 shadow-[0_8px_40px_rgba(100,90,80,0.10)]">

        {/* Top highlight line */}
        <div className="pointer-events-none absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

        {/* Header */}
        <div className="mb-8">
          <p className="mb-[7px] text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#9c9288] flex items-center gap-[6px]">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#a09080]" />
            Reserve a space
          </p>
          <h1 className="font-serif text-[30px] font-semibold tracking-tight text-[#2c2820] leading-[1.15] mb-[6px]">
            Booking form
          </h1>
          <p className="text-[13px] text-[#9c9288] leading-[1.5]">
            Fill in the details below to confirm your reservation.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* ── Purpose ── */}
          <Controller
            name="purpose"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <FieldLabel>Purpose</FieldLabel>
                <textarea
                  {...field}
                  placeholder="Describe the purpose of your booking…"
                  rows={3}
                  onChange={(e) => {
                    field.onChange(e)
                    setActiveChip(null)
                  }}
                  className="w-full resize-none rounded-[10px] border border-[#cdc7c0] bg-[#ebe7e2] px-[13px] py-[10px] text-[14px] text-[#2c2820] placeholder:text-[#b8b0a8] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10"
                />
                <div className="mt-2 flex flex-wrap gap-[7px]">
                  {PURPOSE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={[
                        "rounded-full border-[1.5px] px-[13px] py-[5px] text-[12px] font-medium transition shadow-[0_1px_3px_rgba(100,88,76,0.09)]",
                        activeChip === chip
                          ? "border-[#3a3028] bg-[#3a3028] text-[#e8e0d5] shadow-[0_2px_8px_rgba(40,32,24,0.18)]"
                          : "border-[#b8afa6] bg-[#fff8f2] text-[#5a5048] hover:border-[#8a7e74] hover:bg-[#f0e8e0] hover:text-[#2c2820] hover:shadow-[0_2px_6px_rgba(100,88,76,0.13)]",
                      ].join(" ")}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                {fieldState.invalid && (
                  <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />

          {/* ── Expected Attendees ── */}
          <Controller
            name="expectedAttendees"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <FieldLabel>Expected attendees</FieldLabel>
                <div className="flex items-center overflow-hidden rounded-[10px] border-[1.5px] border-[#b8afa6] bg-[#fff8f2] shadow-[0_1px_3px_rgba(100,88,76,0.09)] w-fit">
                  <button
                    type="button"
                    onClick={() => field.onChange(Math.max(0, (field.value as number) - 1))}
                    className="flex h-10 w-10 items-center justify-center text-[17px] text-[#6e6258] transition hover:bg-[#f0e8e0] hover:text-[#2c2820]"
                  >
                    −
                  </button>
                  <span className="h-[22px] w-px bg-[#cdc7c0]" />
                  <span className="min-w-[36px] text-center text-[15px] font-medium text-[#2c2820]">
                    {field.value as number}
                  </span>
                  <span className="h-[22px] w-px bg-[#cdc7c0]" />
                  <button
                    type="button"
                    onClick={() => field.onChange((field.value as number) + 1)}
                    className="flex h-10 w-10 items-center justify-center text-[17px] text-[#6e6258] transition hover:bg-[#f0e8e0] hover:text-[#2c2820]"
                  >
                    +
                  </button>
                </div>
                <p className="mt-[5px] text-[11.5px] text-[#b8b0a8]">Set to 0 if there are no attendees.</p>
                {fieldState.invalid && (
                  <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />

          {/* ── Start ── */}
          <div>
            <SectionDivider>Start</SectionDivider>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <FieldLabel>Date</FieldLabel>
                <DatePickerButton
                  value={startDate}
                  open={startOpen}
                  onOpenChange={setStartOpen}
                  onSelect={setStartDate}
                />
              </div>
              <Controller
                name="startTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <FieldLabel>Time</FieldLabel>
                    <input
                      {...field}
                      type="time"
                      step="60"
                      className="w-full rounded-[10px] border border-[#cdc7c0] bg-[#ebe7e2] px-[13px] py-[10px] text-[14px] text-[#2c2820] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10 [color-scheme:light]"
                    />
                    {fieldState.invalid && (
                      <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* ── End ── */}
          <div>
            <SectionDivider>End</SectionDivider>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <FieldLabel>Date</FieldLabel>
                <DatePickerButton
                  value={endDate}
                  open={endOpen}
                  onOpenChange={setEndOpen}
                  onSelect={setEndDate}
                />
              </div>
              <Controller
                name="endTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <FieldLabel>Time</FieldLabel>
                    <input
                      {...field}
                      type="time"
                      step="60"
                      className="w-full rounded-[10px] border border-[#cdc7c0] bg-[#ebe7e2] px-[13px] py-[10px] text-[14px] text-[#2c2820] outline-none transition focus:border-[#a09080] focus:bg-[#e8e2dc] focus:ring-2 focus:ring-[#a09080]/10 [color-scheme:light]"
                    />
                    {fieldState.invalid && (
                      <p className="mt-[5px] text-[11.5px] text-[#b05840]">{fieldState.error?.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3a3028] px-4 py-[14px] text-[14.5px] font-medium tracking-[0.04em] text-[#e8e0d5] shadow-[0_4px_16px_rgba(40,32,24,0.18)] transition hover:bg-[#2c2820] active:scale-[0.98]"
          >
            <ArrowIcon />
            Confirm booking
          </button>

        </form>
      </div>
    </div>
  )
}