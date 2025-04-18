"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  deleteCommunities, getCommunitiesByOrganizationForUser,
} from '@/lib/actions/community';
import { addCommunityToUser, removeCommunityFromUser } from '@/lib/actions/user';
import {useToast} from "@/hooks/use-toast.js";
import VisibilityLabel from "@/components/VisibilityLabel.jsx";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function OrganizationCommunityList({organization}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useMainContext();
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const orgData = await getCommunitiesByOrganizationForUser(organization.id, appUser);
      setCommunities(orgData.communities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [appUser]);

  async function handleAddCommunityToUser(communityId) {
    if (!appUser?.id) {
      setError('User not logged in');
      return;
    }
    setJoinStatus((prev) => ({ ...prev, [communityId]: { loading: true, error: null } }));
    try {
      const result = await addCommunityToUser(communityId, appUser.id);
      if(!result.success) {
        return console.error(result.error);
      }
      await fetchCommunities();
      toast({
        title: "Community Added",
        description: `You have been added to the community!`,
      });
      location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveCommunityFromUser(communityId) {
    if (!appUser?.id) {
      setError('User not logged in');
      return;
    }
    setJoinStatus((prev) => ({ ...prev, [communityId]: { loading: true, error: null } }));
    try {
      await removeCommunityFromUser(communityId, appUser.id);
      toast({
        title: "Community Removed",
        description: `You have been removed from the community!`,
      });
      await fetchCommunities();
      location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCommunity(communityId) {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const resp = await deleteCommunities(communityId);

      if (!resp.success) {
        return toast({
          title: "Error",
          description: resp.error,
        })
      }
      location.reload();
      toast({
        title: "Community Deleted",
        description: 'You have deleted from the community',
      })
    }
  }

  const isUserInCommunity = (communityId) => appUser?.communities?.some((c) => c.id === communityId) || false;

  const isCommunityLeader = (communityId) => {
    return appUser?.communities?.some(
      (c) => c.id === communityId && c.role === "leader"
    ) || false;
  };

  if (loading) return <div className="p-4 w-full">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="">
      {communities?.length === 0 ? (
        <p>No communities exist in this organization yet.</p>
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => {
            const status = joinStatus[community.id] || {};
            const isMember = isUserInCommunity(community.id);
            return (
              <li key={community.id} className="border p-4 rounded-md">
                <Link href={`/communities/${community.id}/posts`}>
                  <h4 className="text-lg font-medium flex gap-2 items-center">
                    <div>{community.name}</div>
                    <VisibilityLabel visibility={community?.visibility} />
                  </h4>
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {!isMember ? (
                    <Button
                      className=""
                      variant="outline"
                      onClick={() => handleAddCommunityToUser(community.id)}
                      disabled={status.loading}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      className=""
                      variant="outline"
                      onClick={() => handleRemoveCommunityFromUser(community.id)}
                      disabled={status.loading}
                    >
                      Leave
                    </Button>
                  )}
                  <Button asChild className="" variant="outline">
                    <Link href={`/communities/${community.id}/invite`}>Invite others to community</Link>
                  </Button>

                  {isCommunityLeader(community.id) && (
                    <Button onClick={()=> handleDeleteCommunity(`${community.id}`)} className="" variant="outline">
                      Delete
                    </Button>
                  )}
                </div>
                {status.error && <p className="text-red-500 text-sm mt-1">{status.error}</p>}
                {status.success && !status.loading && <p className="text-green-500 text-sm mt-1">{status.success}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
