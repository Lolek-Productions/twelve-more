'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {useAppUser} from "@/hooks/useAppUser";

export default function CommunityNav() {
  const [loading, setLoading] = useState(false);
  const { appUser } = useAppUser();

  // Define the fallback item when no communities exist
  const fallbackLink = {
    id: 'join-community', // Unique key for the fallback
    name: 'Join a Community',
    href: '/communities/',
  };

  // Filter communities to only include those with an id, then decide on fallback
  const validCommunities = appUser?.communities?.filter((community) =>
    community.id && typeof community.id === 'string' && community.id.trim() !== ''
  ) || [];

  const communitiesToRender = validCommunities.length > 0
    ? validCommunities
    : [fallbackLink];

  return (
    <div className="p-3 bg-gray-100 rounded-md mt-2">
      <div className="flex items-center">
        <div className="ml-2 text-xl font-semibold mb-1">My Communities</div>
      </div>
      <div>
        {communitiesToRender.map((community) => (
          <Link
            key={community.id} // Use id or _id depending on your data
            href={community.href || `/communities/${community.id}`} // Fallback to dynamic href
            className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
          >
            <span className="text-xl mr-2">·</span>
            <span>{community.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}