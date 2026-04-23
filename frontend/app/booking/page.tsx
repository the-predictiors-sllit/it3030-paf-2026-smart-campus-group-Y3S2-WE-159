import { MyBookings } from "@/components/custom/MyBookings"

const page = () => {
  return (
    <main className="p-5">
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          My bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your space reservations.
        </p>
      </div>
      <MyBookings />
    </main>
  )
}

export default page
