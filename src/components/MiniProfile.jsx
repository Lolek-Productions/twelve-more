'use client';

import { useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

export default function MiniProfile() {
  const { user } = useUser();
  const userButtonRef = useRef(null); // Reference for UserButton

  if (!user) {
    return null;
  }

  // Function to simulate clicking the UserButton
  const handleClick = () => {
    if (userButtonRef.current) {
      userButtonRef.current.click(); // Simulate a click on UserButton
    }
  };

  return (
    <div className='flex items-center gap-3 py-5'>
      <UserButton />
      <div className='font-bold text-sm'>{user.fullName}</div>
    </div>
  );
}
