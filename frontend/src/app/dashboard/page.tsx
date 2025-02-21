"use client"
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react'
import React from 'react'

const page = () => {
  const {data :session}=useSession();
  return (
    <div>
      {JSON.stringify(session)} 
      <Button onClick={()=>signOut()}>Signout</Button>
    </div>
  )
}

export default page
