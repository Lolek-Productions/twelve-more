'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUserCommunities } from '@/lib/actions/community';
import {useUser} from "@clerk/nextjs";
import {useAppUser} from "@/hooks/useAppUser";

export default function CommunityNav() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { appUser } = useAppUser();

  return (
    <div className="p-3 bg-gray-100 rounded-md mt-2">
      <div className="flex items-center">
        <div className="ml-2 font-semibold">My Communities</div>
      </div>
      <div>
        {
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
        }
      </div>
    </div>
  );
}