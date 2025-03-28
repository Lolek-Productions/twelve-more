'use client'

import {useEffect} from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import {useRouter} from "next/navigation";

export default function Landing() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if user is logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // If authentication is still loading, you could show a loading state
  if (!isLoaded) {
    return <div className="max-w-4xl mx-auto px-12 py-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-12 py-10 text-center bg-white rounded-lg">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="12More"
          className={'mx-auto'}
          width={80}
          height={80}
          priority
        />
      </div>
      <h1 className="mt-3 text-[50px] font-bold text-gray-800 leading-normal">
        12More
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
