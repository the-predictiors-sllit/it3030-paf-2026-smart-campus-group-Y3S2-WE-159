"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookingForm({ resourceId }: { resourceId: string }) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 0
  });
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Innovation 2: Real-time Conflict Checker
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const checkConflict = async () => {
        const res = await fetch(`/api/bookings/check-availability?resourceId=${resourceId}&start=${formData.startTime}&end=${formData.endTime}`);
        const available = await res.json();
        setIsAvailable(available);
      };
      checkConflict();
    }
  }, [formData.startTime, formData.endTime, resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': 'usr_1001' },
      body: JSON.stringify({ ...formData, resourceId }),
    });
    
    if (response.ok) alert("Booking Requested!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-bold">Book Resource: {resourceId}</h3>
      <Input type="datetime-local" onChange={(e) => setFormData({...formData, startTime: e.target.value})} required />
      <Input type="datetime-local" onChange={(e) => setFormData({...formData, endTime: e.target.value})} required />
      
      {/* Availability Indicator */}
      {isAvailable === true && <p className="text-green-600 text-sm">✅ Slot is available</p>}
      {isAvailable === false && <p className="text-red-600 text-sm">❌ This time is already booked</p>}

      <Input placeholder="Purpose (e.g., Project Meeting)" onChange={(e) => setFormData({...formData, purpose: e.target.value})} required />
      <Input type="number" placeholder="Expected Attendees" onChange={(e) => setFormData({...formData, expectedAttendees: parseInt(e.target.value)})} />
      
      <Button type="submit" disabled={isAvailable === false}>Request Booking</Button>
    </form>
  );
}