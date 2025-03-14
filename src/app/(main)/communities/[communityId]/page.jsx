'use client'

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react'; // Import use from React
import CommunityFeed from '@/components/CommunityFeed';
import Input from '@/components/Input';
import { getCommunityById } from "@/lib/actions/community.js";
import { useContextContent } from "@/components/ContextProvider.jsx";
import CommunityContextSidebar from "@/components/CommunityContextSidebar.jsx";

export default function CommunitiesHome({ params }) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const { communityId } = resolvedParams;

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  const { setContextContent, clearContextContent } = useContextContent();

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        if (communityId) {
          const communityData = await getCommunityById(communityId);
          setCommunity(communityData);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunityData();
  }, [communityId]);

  // Create a stable onClose callback that won't change on re-renders
  const handleClose = useCallback(() => {
    clearContextContent();
  }, [clearContextContent]);

  // Set up context sidebar
  useEffect(() => {
    if (!community) return;

    // Create desktop and mobile components
    const desktopComponent = <CommunityContextSidebar community={community} communityId={communityId} />;
    const mobileComponent = <CommunityContextSidebar community={community} communityId={communityId} onClose={handleClose} />;

    setContextContent(desktopComponent, mobileComponent);

    // Clean up when the component unmounts
    return () => {
      clearContextContent();
    };
  }, [setContextContent, handleClose, clearContextContent, community, communityId]);

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
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>{community.name}</h2>
        </div>
        <Input communityId={communityId}/>
        <CommunityFeed communityId={communityId} />
      </div>
    </div>
  );
}