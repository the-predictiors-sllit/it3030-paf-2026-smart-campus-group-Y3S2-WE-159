"use client"
import { ResourceView } from '@/components/custom/ResourceView'
import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
  const params = useParams();
  const id = params.id as string;
  return (
    <main>
      <h1 className=' text-2xl'>Submit a ticket</h1>
      <section className='flex flex-row'>
        <div className='basis-2/3'>
          <ResourceView id={id} />
        </div>
        <div className='basis-1/3'>
          for the ticket form
        </div>
      </section>
    </main>
  )
}

export default page