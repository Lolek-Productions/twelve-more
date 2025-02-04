import React from 'react';
import moment from 'moment';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Landing() {

  const currentYear = moment().year();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">TwelveMore</div>
          <nav className="space-x-4">
            <SignedIn>
              <a href="/home" className="text-gray-600 hover:text-gray-800">Home</a>
            </SignedIn>
            <SignedOut>
              <a href="/sign-in" className="text-gray-600 hover:text-gray-800">Log In</a>
            </SignedOut>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center bg-white rounded-lg">
        <h1 className="text-4xl font-bold text-gray-800 leading-normal">
          Foster belonging, Promote growth,<br />
          Equip communities
        </h1>
        <p className="mt-4 text-gray-600">
          Join TwelveMore to start Building!
        </p>

        <Button asChild className='mt-5'>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>

      <footer className="bg-gray-800">
        <div className="container mx-auto px-6 py-4 text-center text-white">
          &copy; {currentYear} TwelveMore. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
