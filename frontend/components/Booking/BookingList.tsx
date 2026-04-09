"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";

export default function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetching from your ListBookingsResponse DTO structure
    fetch('/api/bookings?userId=usr_1001')
      .then(res => res.json())
      .then(data => setBookings(data.data.items || []));
  }, []);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold">My Bookings</h2>
      <div className="grid gap-4">
        {bookings.map((b: any) => (
          <div key={b.id} className="p-4 border rounded-lg flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-lg">{b.resourceInfo?.name || "Resource"}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
              </p>
              <p className="text-sm italic">"{b.purpose}"</p>
            </div>
            <Badge variant={b.status === 'APPROVED' ? 'default' : 'outline'}>
              {b.status}
            </Badge>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-muted-foreground italic">No bookings found.</p>}
      </div>
    </div>
  );
}