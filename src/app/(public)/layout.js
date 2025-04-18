import {SignedIn, SignedOut} from '@clerk/nextjs'
import React from "react";
import Link from 'next/link';
import moment from "moment/moment";
import { Button } from "@/components/ui/button";

export default function RootLayout({children}) {
  const currentYear = moment().year();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">12More</Link>
          <nav className="space-x-10">
            <Link href="/about" className="text-gray-600 hover:text-gray-800">About</Link>
            <SignedIn>
              <Link href="/home">
                <Button variant="outline" size="sm" className="font-medium">
                  Home
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="font-medium">
                  Log In
                </Button>
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>
      {children}
      <footer className="bg-gray-800">
        <div className="container mx-auto px-6 py-4 text-center text-white">
          <p>&copy; {currentYear} 12More. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}