'use client'

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import CommunityFeed from '@/components/CommunityFeed';
import PostInput from '@/components/PostInput.jsx';
import { getCommunityById } from "@/lib/actions/community.js";
import { useContextContent } from "@/components/ContextProvider.jsx";
import CommunityContextSidebar from "@/components/CommunityContextSidebar.jsx";

export default function CommunitiesHome({ params }) {
  const resolvedParams = use(params);
  const { communityId } = resolvedParams;

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        if (communityId) {
          const communityData = await getCommunityById(communityId);
          setCommunity(communityData.community);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityData();
  }, [communityId]);

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<CommunityContextSidebar community={community} communityId={communityId} />);
  }, [setContextContent, community, communityId]);

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Community not found</p>
      </div>
    );
  }

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>{community.name}</h2>
      </div>
      <PostInput communityId={communityId} placeholder={`Post to the ${community.name} community`} />
      <CommunityFeed communityId={communityId} />
    </>
  );
}