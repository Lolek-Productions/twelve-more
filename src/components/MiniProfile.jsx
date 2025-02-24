'use client';

import { useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { DEV_PHONE_NUMBERS } from '@/lib/constants';

export default function MiniProfile() {
  const { user, isLoaded } = useUser(); // Add isLoaded to handle loading state
  const userButtonRef = useRef(null);

  // Wait for Clerk to load user data
  if (!isLoaded || !user) {
    return <div>Loading...</div>; // Or your preferred loading component
  }

  // Check if user is a developer
  const isDeveloper = user?.phoneNumbers?.some(phone =>
    DEV_PHONE_NUMBERS.includes(phone.phoneNumber)
  );

  const handleClick = () => {
    if (userButtonRef.current) {
      userButtonRef.current.click();
    }
  };

  return (
    <div className='flex items-center gap-3 py-5'>
      <UserButton />
      <div className='flex flex-col'>
        {/* Use Clerk's firstName and lastName */}
        <div className='font-bold text-sm'>
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.fullName || ''} {/* Fallback to fullName or 'User' */}
        </div>
        {/* Developer badge */}
        {isDeveloper && (
          <span className='text-xs bg-blue-500 text-white px-2 py-1 rounded-full mt-1'>
            Developer
          </span>
        )}
      </div>
    </div>
  );
}