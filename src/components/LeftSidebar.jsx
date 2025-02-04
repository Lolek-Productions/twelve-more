import Link from 'next/link';
import Image from 'next/image';
import { FaXTwitter } from 'react-icons/fa6';
import { HiHome } from 'react-icons/hi';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from '@clerk/nextjs';
import MiniProfile from './MiniProfile';

export default function LeftSidebar() {
  return (
    <div className='flex flex-col p-3 justify-between h-screen items-center'>
      <div className='flex flex-col gap-4 p-3 w-48'>
        <Link href='/home'>
        <Image
          src="/logo.png" // Use the path from the public folder
          alt="TwelveMore"
          width={45} // Adjust width as needed
          height={45} // Adjust height as needed
          priority // Ensures faster loading
        />
        </Link>
        <Link href='/home' className='flex items-center p-3 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit'>
          <HiHome className='w-7 h-7' />
          <span className='font-bold hidden xl:inline'>Home</span>
        </Link>
        {/* <div className='inline font-semibold'> */}
          {/* <SignedIn>
            <SignOutButton className="bg-blue-400 text-white rounded-full hover:brightness-95 transition-all duration-200 w-48 h-9 shadow-md" />
          </SignedIn>
          <SignedOut>
            <SignInButton className="bg-blue-400 text-white rounded-full hover:brightness-95 transition-all duration-200 w-48 h-9 shadow-md" />
          </SignedOut> */}
        {/* </div> */}
      </div>
      <SignedIn>
        <MiniProfile />
      </SignedIn>
    </div>
  );
}
