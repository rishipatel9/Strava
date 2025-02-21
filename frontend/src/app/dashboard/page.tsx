"use client"
import Component from '@/components/comp-377';
import LiveLocationMap from '@/components/Location';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react'
import React from 'react'

const page = () => {
  const {data :session}=useSession();
  return (
    <div className='p-4 md:p-2'>
      <LiveLocationMap/>
    </div>
  )
}

export default page
