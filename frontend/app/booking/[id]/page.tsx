"use client"
import { BookingForm } from '@/components/custom/BookingForm';
import { ResourceView } from '@/components/custom/ResourceView';
import { useParams } from 'next/navigation';

const page = () => {
  const params = useParams();
  const id = params.id as string;
  return (
    <main className='p-5'>
      {/* <h1 className=' text-2xl'>Book Resource</h1> */}
      <section className='flex flex-row gap-3'>
        <div className='basis-2/3'>
          <ResourceView id={id} />
        </div>
        <div className='basis-1/3'>
          <BookingForm id = {id}/>
        </div>
      </section>
    </main>
  )
}

export default page