"use client"
import { AddComments } from '@/components/custom/AddComments';
import { TicketPreview } from '@/components/custom/TicketPreview';
import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
    const params = useParams();
    const id = params.id as string;
    return (
        <main>
            <section className='flex flex-row h-[85dvh] mt-5'>
                <div className='basis-2/4 overflow-auto no-scrollbar'>
                    <TicketPreview ticketId={id}/>
                </div>
                <div className='basis-2/4'>
                    <h1>Comments</h1>
                    {/* <p>{id}</p> */}
                    <AddComments ticketId={id}/>
                </div>
            </section>
        </main>
    )
}

export default page