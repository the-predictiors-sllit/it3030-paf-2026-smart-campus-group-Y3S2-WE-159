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
  endTime: z.string().min(1, "End time is required")
});

type BookingFormInput = z.input<typeof bookingSchema>;
type BookingFormData = z.infer<typeof bookingSchema>;

export const BookingForm = ({ id }: { id: string }) => {

  const [startDateOpen, setStartDateOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDateOpen, setEndDateOpen] = React.useState(false)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const router = useRouter();



  const form = useForm<BookingFormInput, any, BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "",
      expectedAttendees: 0,
      startTime: "10:30",
      endTime: "11:30"
    },
  })


  const onSubmit = async (values: BookingFormData) => {
    try {
      // convert date and time to date time
      const combineDateTime = (date: Date, time: string) => {
        const d = new Date(date);
        const [hours, minutes, seconds] = time.split(':');
        d.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0, 0);
        return format(d, "yyyy-MM-dd'T'HH:mm:ss");
      }

      // to show error is there is no start date and end data
      if (!startDate || !endDate) {
        toast.warning("Submit failed: start or end date was missing")
        throw new Error("Data was null or missing");
      }


      const payload = {
        resourceId: id,
        purpose: values.purpose,
        expectedAttendees: values.expectedAttendees,
        startTime: combineDateTime(startDate, values.startTime),
        endTime: combineDateTime(endDate, values.endTime),
      };

      // api
      const response = await fetch('/api/bookings', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Failed to create booking";

        try {
          const errorBody = await response.json();
          message = errorBody?.error?.message || message;
        } catch {
          // Keep fallback message when response body is not JSON.
        }

        throw new Error(message);
      }

      toast.success("Booking created successfully!");

      router.push("/booking");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error creating booking";
      toast.error(message);
      console.error(error);
    }
  }


  return (
    <div className="w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Booking form</FieldLegend>
            <FieldDescription>
              Fill the details
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
                      <FieldDescription>
                        If there is none keep this empty
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

                  <FieldLabel htmlFor="date-picker-optional">Start Date</FieldLabel>
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
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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

                        <FieldLabel htmlFor="time-picker-optional">Start Time</FieldLabel>
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

                    )} />

                </Field>
              </FieldGroup>



              {/* End time */}


              <FieldGroup className="mx-auto  flex-row">
                <Field>
                  <FieldLabel htmlFor="date-picker-optional">End Date</FieldLabel>
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
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
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

                        <FieldLabel htmlFor="time-picker-optional">End Time</FieldLabel>
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

                    )} />

                </Field>
              </FieldGroup>

            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form >
    </div >
  )
}
