'use client';

import { useState } from 'react';
import { useClerk, useUser, SignOutButton } from '@clerk/nextjs';
import {DEV_IDS} from '@/lib/constants';
import { Button } from "@/components/ui/button.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MiniProfile() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  // Early returns for loading and null states
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  // Check developer status
  const isDeveloper = DEV_IDS.includes(user.publicMetadata.userMongoId) || false;

  // Get user's display name
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.fullName || 'User';

  // Handlers that close the popover
  const handleProfileClick = () => {
    openUserProfile();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3 py-5">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="transparent"
            className="flex items-center gap-2"
          >
            <div className={'flex items-center gap-3'}>
              <Avatar className="h-11 w-11">
                <AvatarImage src={user.imageUrl} alt={displayName} />
                <AvatarFallback>
                  {user.firstName?.[0] || user.fullName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-start gap-1'>
                <div>{displayName}</div>
                {isDeveloper && (
                  <span className="text-xs bg-blue-500 t text-white px-2 py-0.5 rounded-full">
                    Dev
                  </span>
                )}
              </div>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            {/* Profile Header with Avatar */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.imageUrl} alt={displayName} />
                <AvatarFallback>
                  {user.firstName?.[0] || user.fullName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="font-bold">{displayName}</span>
                <span className="text-sm text-muted-foreground">
                  {user.primaryPhoneNumber?.phoneNumber || 'No phone'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleProfileClick}
              >
                View Profile
              </Button>

              <SignOutButton>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                >
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}