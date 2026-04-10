"use client"

import { UserCard_navbar } from '@/components/custom/UserCard_navbar'
import { PageNavigation } from '@/components/custom/PageNavigation'
import { NotificationIcon } from '@/components/custom/NotificationIcon'
import { DarkLight } from "@/components/custom/DarkLightBtn"


export const NavigationBar = () => {
  return (
    <div className="relative">
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <div className="flex-shrink-0">Logo</div>
        <PageNavigation />
        <div className="hidden lg:block">
          <div className=' flex flex-row gap-2'>

            <UserCard_navbar />
            <NotificationIcon />
            <DarkLight />
          </div>
        </div>
      </nav>
    </div>
  )
}














// import React from 'react'
// import { UserCard_navbar } from './UserCard_navbar'
// import { PageNavigation } from './PageNavigation'

// export const NavigationBar = () => {
//   return (
//     <div>
//         <nav className='flex items-center justify-between px-8 py-4 border-b'>
//             <div>Logo</div>
//             <div><PageNavigation/></div>
//             <div className=''><UserCard_navbar/></div>
//         </nav>
//     </div>
//   )
// }
