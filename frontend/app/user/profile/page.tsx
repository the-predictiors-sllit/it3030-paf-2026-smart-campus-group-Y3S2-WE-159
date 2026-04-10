import { UserProfileCard } from '@/components/custom/UserProfileCard'
import React from 'react'


const page = () => {
  return (
    <main className='flex flex-row'>
      <div className='basis-1/3'><UserProfileCard/></div>
      <div className='basis-2/3'>02</div>
    </main>
  )
}

export default page