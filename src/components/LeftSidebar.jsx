import Link from 'next/link';
import Image from 'next/image';
import { HiHome, HiCog, HiOutlineUserGroup, HiOutlineServer } from 'react-icons/hi';
import MiniProfile from './MiniProfile';

export default function LeftSidebar() {
  return (
    <div className='flex flex-col p-3 justify-between h-screen items-center'>
      <div className='flex flex-col gap-3 p-3 w-48'>
        <Link href='/home' className='flex items-center gap-2'>
          <Image
            src="/logo.png" // Use the path from the public folder
            alt="TwelveMore"
            width={45} // Adjust width as needed
            height={45} // Adjust height as needed
            priority // Ensures faster loading
          />
          <div className='font-semibold text-xl'>TwelveMore</div>
        </Link>

        <div className="space-y-1 mt-2">
          <Link href='/home' className='flex items-center p-2 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit'>
            <HiHome className='w-6 h-6' />
            <span className='font-bold hidden xl:inline'>Home</span>
          </Link>

          <Link href='/settings' className='flex items-center p-2 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit'>
            <HiCog className='w-6 h-6' />
            <span className='font-bold hidden xl:inline'>Settings</span>
          </Link>

          <Link href='/admin' className='flex items-center p-2 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit'>
            <HiOutlineServer className='w-6 h-6' />
            <span className='font-bold hidden xl:inline'>Admin</span>
          </Link>
        </div>

        <div className="p-3 bg-gray-100 rounded-md mt-2">
          <div className="flex items-center">
            <HiOutlineUserGroup className='w-6 h-6' />
            <div className="ml-2 font-semibold">
              Communities
            </div>
          </div>
          <div className="mt-1">

            <Link href='/settings' className='flex items-center p-3 hover:bg-gray-100 rounded-full transition-all duration-200 gap-2 w-fit'>
              <span className=''>
                <span className='text-xl mr-2'>·</span>
                Lolek
              </span>
            </Link>
          </div>
        </div>

      </div>
      <MiniProfile />
    </div>
  );
}
