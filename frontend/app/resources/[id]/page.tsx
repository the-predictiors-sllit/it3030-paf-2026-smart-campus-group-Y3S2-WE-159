"use client"
import { ResourceView } from '@/components/custom/ResourceView';
import { useParams } from 'next/navigation';
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';





const page = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const handleBookingClick = () => {
    router.push(`/booking/${id}`)
  }
  const handleIncidentTicketClick = () => {
    router.push(`/tickets/${id}`)
  }
  return (
    <main>
      <section className='flex flex-row'>
        <div className='basis-2/3'>
        <ResourceView id={id} />
        </div>
        <div className='basis-1/3'>
          <div className='flex flex-col'>

            <Button onClick={handleIncidentTicketClick}>Incident Ticket</Button>
            <Button onClick={handleBookingClick}>Book Now</Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default page



