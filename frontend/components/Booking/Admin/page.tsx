import BookingForm from "@/components/Booking/BookingForm";
import BookingList from "@/components/Booking/BookingList";

export default function BookingsPage() {
  return (
    <main className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Campus Booking Hub</h1>
      
      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <BookingForm resourceId="RES_001" /> {/* Replace with dynamic ID later */}
        </section>
        
        <section>
          <BookingList />
        </section>
      </div>
    </main>
  );
}