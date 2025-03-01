"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import { getCommunitiesByOrganization } from '@/lib/actions/community';
import {addCommunityToUser} from "@/lib/actions/user.js";
import {useRouter} from "next/navigation";

export default function CommunitiesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const { appUser } = useAppUser();
  const router = useRouter()

  useEffect(() => {
    // console.log('Inside useEffect - appUser:', appUser);

    async function fetchCommunities() {
      if (!appUser) {
        return;
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
  }, [appUser]); // Depend on appUser itself, not just selectedOrganization.id


  async function handleAddCommunityToUser(communityId) {
    if (!appUser?.id) {
      setError('User not logged in');
      return;
    }

    try {
      const result = await addCommunityToUser(communityId, appUser.id);
      router.push(`/communities/${communityId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="p-4 w-[30rem]">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 w-[30rem]">
      <h3 className="text-xl font-semibold mb-4">Community List</h3>
      {communities.length === 0 ? (
        <div>
          <p>No communities exist in this organization yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => (
            <li key={community.id} className="border p-4 rounded-md">
              <Link href={`/communities/${community.id}`}>
                <h4 className="text-lg font-medium">{community.name}</h4>
                <p className="text-muted-foreground">{community.description}</p>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={() => {handleAddCommunityToUser(community.id)}}
                >
                  Join
                </Button>
                <Button
                  asChild
                  className="mt-2"
                  variant="outline"
                >
                  <Link href={`/communities/${community.id}/invite`}>
                    Invite others to community
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}