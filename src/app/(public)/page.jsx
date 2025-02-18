import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';


export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto px-12 py-10 text-center bg-white rounded-lg">
      <h1 className="text-4xl font-bold text-gray-800 leading-normal">
        Foster belonging, Promote growth,<br />
        Equip communities
      </h1>
      <p className="mt-4 text-gray-600">
        Join TwelveMore to start Building
      </p>

      <Button asChild className='mt-5'>
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  )
}
