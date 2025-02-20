// components/CommunityNav.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUserCommunities } from '@/lib/actions/community';

export default function CommunityNav() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunities() {
      const result = await getUserCommunities();
      if (result.success) {
        setCommunities(result.communities);
      } else {
        console.error('Failed to fetch communities:', result.error);
      }
      setLoading(false);
    }
    fetchCommunities();
  }, []);

  return (
    <div className="p-3 bg-gray-100 rounded-md mt-2">
      <div className="flex items-center">
        <div className="ml-2 font-semibold">Communities</div>
      </div>
      <div>
        {loading ? (
          <p className="p-3 text-gray-500">Loading communities...</p>
        ) : communities.length === 0 ? (
          <p className="p-3 text-gray-500">No communities found</p>
        ) : (
          communities.map((community) => (
            <Link
              key={community.id}
              href={`/community/${community.id}`} // Adjust href as needed
              className="flex items-center p-3 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
            >
              <span className="text-xl mr-2">·</span>
              <span>{community.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}