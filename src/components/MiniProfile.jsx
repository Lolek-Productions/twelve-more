'use client';

import { useClerk, useUser } from '@clerk/nextjs';

export default function MiniProfile() {
  const { user } = useUser();
  const { openUserProfile } = useClerk(); // Clerk function to open profile modal

  if (!user) {
    return null;
  }

  // Function to open the User Profile modal
  const handleClick = () => {
    openUserProfile(); // Opens Clerk's User Profile modal
  };

  return (
    <div
      className='text-gray-700 text-sm flex items-center cursor-pointer p-3 hover:bg-gray-100 rounded-full transition-all duration-200 justify-between lg:w-40 xl:w-56 w-fit gap-2'
      onClick={handleClick} // Clicking anywhere on the div triggers User Profile
    >
      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <img src={user.imageUrl} alt="User Avatar" className="w-full h-full object-cover" />
      </div>

      {/* Username & Handle */}
      <div className='hidden lg:inline flex-1 w-8'>
        <h4 className='font-bold text-sm truncate'>{user.fullName}</h4>
      </div>

    </div>
  );
}
