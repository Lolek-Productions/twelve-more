"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { getCommunitiesByOrganization } from '@/lib/actions/community';
import { addCommunityToUser, removeCommunityFromUser } from '@/lib/actions/user';
import {useToast} from "@/hooks/use-toast.js";

export default function CommunitiesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useAppUser();
  const router = useRouter();
  const { toast } = useToast();

  const fetchCommunities = async () => {
    if (!appUser) return;
    if (!appUser.selectedOrganization?.id) {
      setError('No organization selected');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const orgCommunities = await getCommunitiesByOrganization(appUser.selectedOrganization.id);
      setCommunities(orgCommunities);
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

  const isUserInCommunity = (communityId) => appUser?.communities?.some((c) => c.id === communityId) || false;

  if (loading) return <div className="p-4 w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 w-[30rem]">
      {communities.length === 0 ? (
        <p>No communities exist in this organization yet.</p>
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => {
            const status = joinStatus[community.id] || {};
            const isMember = isUserInCommunity(community.id);
            return (
              <li key={community.id} className="border p-4 rounded-md">
                <Link href={`/communities/${community.id}`}>
                  <h4 className="text-lg font-medium">{community.name}</h4>
                  <p className="text-muted-foreground">{community.description}</p>
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
