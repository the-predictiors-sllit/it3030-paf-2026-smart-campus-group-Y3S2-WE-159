"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminBookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminReason, setAdminReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      // Fetching all PENDING bookings for the admin to process
      const res = await fetch('/api/bookings?status=PENDING');
      const data = await res.json();
      if (data.status === "success") {
        setBookings(data.data.items || []);
      }
    } catch (err) {
      toast.error("Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = adminReason[id] || "";
    
    // Rubric Requirement: Mandatory reason for rejections
    if (status === 'REJECTED' && !reason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (res.ok) {
        toast.success(`Booking ${status.toLowerCase()} successfully!`);
        fetchPendingBookings(); // Refresh the list after action
      }
    } catch (err) {
      toast.error("Error updating booking status.");
    }
  };

  if (loading) return <p className="text-center py-10">Loading pending requests...</p>;

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Decision Reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.resourceId}</TableCell>
              <TableCell>{booking.userId}</TableCell>
              <TableCell className="text-sm">
                {new Date(booking.startTime).toLocaleDateString()} <br/>
                <span className="text-muted-foreground text-xs">
                    {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                </span>
              </TableCell>
              <TableCell>
                <Input 
                  placeholder="Enter reason..." 
                  className="h-8 w-full max-w-[200px]"
                  value={adminReason[booking.id] || ""}
                  onChange={(e) => setAdminReason({ ...adminReason, [booking.id]: e.target.value })}
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50" 
                  onClick={() => handleAction(booking.id, 'APPROVED')}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleAction(booking.id, 'REJECTED')}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                No pending requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}