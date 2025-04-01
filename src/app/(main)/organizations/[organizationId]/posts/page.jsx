'use client'

import {useState, useEffect, useCallback} from 'react';
import { use } from 'react';
import { useContextContent } from "@/components/ContextProvider.jsx";
import CommunityContextSidebar from "@/components/CommunityContextSidebar.jsx";
import OrganizationFeed from "@/components/OrganizationFeed.jsx";
import {getOrganizationById} from "@/lib/actions/organization.js";
import PostInput from "@/components/PostInput.jsx";
import {getCommunityById} from "@/lib/actions/community.js";
import {useQueryClient} from "@tanstack/react-query";

export default function OrganizationPosts({ params }) {
  const resolvedParams = use(params);
  const { organizationId } = resolvedParams;
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchOrganizationData = useCallback(async () => {
    try {
      if (organizationId) {
        const organizationData = await getOrganizationById(organizationId);
        setOrganization(organizationData.organization);
      } else {
        console.error("Organization Id not found");
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  // Now this function can properly access fetchCommunityData
  const afterPostCreated = useCallback(async () => {
    // console.log("afterPostCreated");
    queryClient.invalidateQueries(['infiniteOrganizationFeed', organizationId]);
  }, [fetchOrganizationData]);

  // const { setContextContent } = useContextContent();
  // useEffect(() => {
  //   setContextContent(<CommunityContextSidebar community={community} organizationId={organizationId} />);
  // }, [setContextContent, community, organizationId]);

  if (loading) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Organization not found</p>
      </div>
    );
  }

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>{organization.name}</h2>
      </div>
      <PostInput organizationId={organizationId} placeholder={`Post to the ${organization.name} organization`} onPostCreated={afterPostCreated} />
      <OrganizationFeed organizationId={organizationId} />
    </>
  );
}