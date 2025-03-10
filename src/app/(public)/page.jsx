import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image.js";


export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto px-12 py-10 text-center bg-white rounded-lg">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="TwelveMore"
          className={'mx-auto'}
          width={80}
          height={80}
          priority
        />
      </div>
      <h1 className="mt-3 text-[50px] font-bold text-gray-800 leading-normal">
        TwelveMore
      </h1>
      <p className=" text-2xl text-gray-600">
        Sign in and find your community
      </p>

      <Button asChild className='mt-9'>
        <Link href="/sign-up">Join Us</Link>
      </Button>
    </div>
)
}
