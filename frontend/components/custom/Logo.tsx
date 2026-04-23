'use client'

import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import logo from '@/assets/Logo.webp'


export const Logo = () => {
  const router = useRouter()

  return (
    <div
      className="relative cursor-pointer"
      style={{ width: 30, height: 30 }}
      onClick={() => router.push('/')}
    >
      <Image
        src={logo}
        alt="Smart Campus"
        fill
        sizes="100px"
        priority
      />
    </div>
  )
}
