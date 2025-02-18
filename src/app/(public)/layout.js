import {SignedIn, SignedOut} from '@clerk/nextjs'
import React from "react";
import Link from 'next/link';
import moment from "moment/moment";

export default function RootLayout({children}) {
  const currentYear = moment().year();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">TwelveMore</Link>
          <nav className="space-x-4">
            <SignedIn>
              <Link href="/home" className="text-gray-600 hover:text-gray-800">Home</Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-800">Log In</Link>
            </SignedOut>
          </nav>
        </div>
      </header>
      {children}
      <footer className="bg-gray-800">
        <div className="container mx-auto px-6 py-4 text-center text-white">
          <p>&copy; {currentYear} TwelveMore. All rights reserved.</p>
          <div className="mt-2">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
