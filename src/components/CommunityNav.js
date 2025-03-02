'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {useAppUser} from "@/hooks/useAppUser";

export default function CommunityNav() {
  const [loading, setLoading] = useState(false);
  const { appUser } = useAppUser();

  return (
    <div className="p-3 bg-gray-100 rounded-md mt-2">
      <div className="flex items-center">
        <div className="ml-2 text-xl font-semibold mb-1">My Communities</div>
      </div>
      <div>
        {
          appUser?.communities?.length > 0
            ?
          appUser?.communities?.map((community) => (
            <Link
              key={community.id}
              href={`/communities/${community.id}`} // Adjust href as needed
              className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
            >
              <span className="text-xl mr-2">·</span>
              <span>{community.name}</span>
            </Link>
          ))
            :
            (
              <Link
                href={`/communities/`} // Adjust href as needed
                className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
              >
                <span className="text-xl mr-2">·</span>
                <span>Join a Community</span>
              </Link>
            )
        }
      </div>
    </div>
  );
}