"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import {
  deleteCommunities, getCommunitiesByOrganization,
} from '@/lib/actions/community';
import { addCommunityToUser, removeCommunityFromUser } from '@/lib/actions/user';
import {useToast} from "@/hooks/use-toast.js";

export default function OrganizationCommunityList({organization}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useAppUser();
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const orgData = await getCommunitiesByOrganization(organization.id);
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
                <Link href={`/communities/${community.id}`}>
                  <h4 className="text-lg font-medium">
                    {community.name}{" "}
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full align-middle">
                      {community?.visibility?.charAt(0).toUpperCase() + community?.visibility?.slice(1)}
                    </span>
                  </h4>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  {!isMember ? (
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => handleAddCommunityToUser(community.id)}
                      disabled={status.loading}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => handleRemoveCommunityFromUser(community.id)}
                      disabled={status.loading}
                    >
                      Leave
                    </Button>
                  )}
                  <Button asChild className="mt-2" variant="outline">
                    <Link href={`/communities/${community.id}/invite`}>Invite others to community</Link>
                  </Button>

                  {isCommunityLeader(community.id) && (
                    <Button onClick={()=> handleDeleteCommunity(`${community.id}`)} className="mt-2" variant="outline">
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
