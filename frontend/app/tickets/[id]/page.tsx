"use client"
import { ResourceView } from '@/components/custom/ResourceView';
import { TicketForm } from '@/components/custom/TicketForm';
import { useParams } from 'next/navigation';

const page = () => {
  const params = useParams();
  const id = params.id as string;
  return (
    <main className='p-5'>
      <section className='flex flex-row gap-3'>
        <div className='basis-3/5'>
          <ResourceView id={id} />
        </div>
        <div className='basis-2/5'>
          <TicketForm resourceId={id}/>
        </div>
      </section>
    </main>
  )
}

export default page