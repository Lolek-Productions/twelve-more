'use client'

import {getCommunitiesByUser} from "@/lib/actions/community.js";
import React, {useEffect, useState} from "react";
import {useMainContext} from "@/components/MainContextProvider.jsx";
import {capitalizeFirstLetter, useApiToast} from "@/lib/utils.js";
import Link from "next/link";
import VisibilityLabel from "@/components/VisibilityLabel.jsx";
import {Button} from "@/components/ui/button.jsx";

export default function CommunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderCommunities, setLeaderCommunities] = useState([]);
  const [memberCommunities, setMemberCommunities] = useState([]);
  const { appUser } = useMainContext();
  const { showResponseToast, showErrorToast } = useApiToast();

  const fetchCommunities = async () => {
    if(!appUser) return;

    try {
      setLoading(true);
      const communityData = await getCommunitiesByUser(appUser);
      console.log(communityData);

      setLeaderCommunities(communityData.leaderCommunities || []);
      setMemberCommunities(communityData.memberCommunities || []);
    } catch (err) {
      setError(err.message);
      showErrorToast("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [appUser]);

  const CommunityCard = ({ community }) => (
    <li className="border p-2 rounded-md shadow-sm hover:shadow-md transition-shadow mb-3">
      <Link href={`/communities/${community.id}/posts`}>
        <div className="flex justify-between items-center">
          <h4 className=" font-medium flex gap-2 items-center">
            <div>{community.name} ({community.organization.name})</div>
            <VisibilityLabel visibility={community?.visibility} />
          </h4>
          {/*<span className="text-sm px-2 py-1 rounded-full">*/}
          {/*  {capitalizeFirstLetter(community.role)}*/}
          {/*</span>*/}
        </div>
      </Link>
    </li>
  );

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          12s I belong to
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p>Loading communities...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          Error loading communities: {error}
        </div>
      ) : (
        <div className="p-4">
          {/* Leadership Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Communities I Lead</h3>
            {leaderCommunities.length === 0 ? (
              <p className="text-gray-500 italic">You are not leading any communities.</p>
            ) : (
              <ul className="space-y-2">
                {leaderCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </ul>
            )}
          </div>

          {/* Membership Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Communities I'm a Member Of</h3>
            {memberCommunities.length === 0 ? (
              <p className="text-gray-500 italic">You are not a member of any communities.</p>
            ) : (
              <ul className="space-y-2">
                {memberCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}