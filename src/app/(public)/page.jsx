import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';


export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto px-12 py-10 text-center bg-white rounded-lg">
      <h1 className="text-[50px] font-bold text-gray-800 leading-normal">
        GET HUNGRY
      </h1>
      <p className="mt-4 text-2xl text-gray-600">
        Sign in and find your community
      </p>

      <Button asChild className='mt-5'>
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  )
}
