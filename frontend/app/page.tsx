import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation';

import React from 'react'

const page = async () => {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login')
  }

  let accessToken = null

  try {
    const { token } = await auth0.getAccessToken();
    accessToken = token;
    console.log(accessToken)
  } catch (error) {
    console.error("Failed to sync with backend: ", error)
  }
  return (
    <div>

      <h1>This is your token</h1>
      <p className='wrap-anywhere'>{accessToken}</p>
    </div>
  )
}

export default page