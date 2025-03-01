"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { getCommunitiesByOrganization } from '@/lib/actions/community';
import { addCommunityToUser } from '@/lib/actions/user';

export default function CommunitiesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useAppUser();
  const router = useRouter();

  useEffect(() => {
    console.log('Inside useEffect - appUser:', appUser);

    async function fetchCommunities() {
      if (!appUser) {
        return; // Wait for appUser to load
      }

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
    }

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
      setJoinStatus((prev) => ({
        ...prev,
        [communityId]: { loading: false, success: result.message },
      }));
      router.push(`/communities/${communityId}`);
    } catch (err) {
      setJoinStatus((prev) => ({
        ...prev,
        [communityId]: { loading: false, error: err.message },
      }));
    }
  }

  // Helper to check if user is already a member of a community
  const isUserInCommunity = (communityId) => {
    return appUser?.communities?.some((c) => c.id === communityId) || false;
  };

  if (loading) {
    return <div className="p-4 w-[30rem]">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 w-[30rem]">
      {/*<h3 className="text-xl font-semibold mb-4">Community List</h3>*/}
      {communities.length === 0 ? (
        <div>
          <p>No communities exist in this organization yet.</p>
        </div>
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
                  {!isMember && (
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => handleAddCommunityToUser(community.id)}
                      disabled={status.loading || status.success}
                    >
                      {status.loading ? 'Joining...' : status.success ? 'Joined' : 'Join'}
                    </Button>
                  )}
                  <Button asChild className="mt-2" variant="outline">
                    <Link href={`/communities/${community.id}/invite`}>
                      Invite others to community
                    </Link>
                  </Button>
                </div>
                {status.error && (
                  <p className="text-red-500 text-sm mt-1">{status.error}</p>
                )}
                {status.success && !status.loading && (
                  <p className="text-green-500 text-sm mt-1">{status.success}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}