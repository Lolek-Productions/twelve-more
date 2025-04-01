'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import CommunityFeed from '@/components/CommunityFeed.jsx';
import PostInput from '@/components/PostInput.jsx';
import { getCommunityById } from "@/lib/actions/community.js";
import { useContextContent } from "@/components/ContextProvider.jsx";
import CommunityContextSidebar from "@/components/CommunityContextSidebar.jsx";
import {useQueryClient} from "@tanstack/react-query";
import Link from "next/link";

export default function CommunityPosts({ params }) {
  const resolvedParams = use(params);
  const { communityId } = resolvedParams;
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Define fetchCommunityData outside of useEffect so it can be reused
  const fetchCommunityData = useCallback(async () => {
    if(!communityId) return;
    try {
      if (communityId) {
        setLoading(true);
        const communityData = await getCommunityById(communityId);
        setCommunity(communityData.community);
      } else {
        console.error("Community Id not found");
      }
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Now this function can properly access fetchCommunityData
  const afterPostCreated = useCallback(async () => {
    console.log("afterPostCreated");
    queryClient.invalidateQueries(['infiniteCommunityFeed', communityId]);
  }, [fetchCommunityData]);

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<CommunityContextSidebar community={community} communityId={communityId} />);
  }, [setContextContent, community, communityId]);

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
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
        <Link href={`/communities/${community.id}/`}>
          <h2 className='text-lg sm:text-xl font-bold'>Community: {community.name}</h2>
        </Link>
      </div>
      <PostInput communityId={communityId} organizationId={community.organization.id} placeholder={`Post to the ${community.name} community`} onPostCreated={afterPostCreated} autoFocus={true} />
      <CommunityFeed communityId={communityId} />
    </>
  );
}