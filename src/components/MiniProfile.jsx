'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { HiDotsHorizontal } from 'react-icons/hi';

export default function MiniProfile() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 py-5">
        <UserButton />

        <div className='font-bold text-sm truncate'>{user && user.fullName}</div>
    </div>
  );
}
