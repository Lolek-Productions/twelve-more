"use client";

import { useState, useEffect } from "react";
import { getUserCommunities } from "@/lib/actions/community"; // Import server action
import { Button } from "@/components/ui/button"; // Assuming you're using a UI library like shadcn/ui
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";

export default function CommunitiesList() {
  const [communities, setCommunities] = useState([]); // Already initialized as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { appUser } = useAppUser();

  useEffect(() => {

    async function fetchCommunities() {
      try {
        setLoading(true);
        const result = await getUserCommunities();
        console.log("Fetch result:", result); // Debug log to inspect the response

        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to fetch communities - no result");
        }

        // Ensure data is an array, even if empty
        const fetchedCommunities = Array.isArray(result.data) ? result.data : [];
        setCommunities(fetchedCommunities);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load your communities: " + err.message);
        setCommunities([]); // Set to empty array on error to prevent undefined
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, []);

  const handleInvite = (communityId) => {
    console.log(`Invite someone to community: ${communityId}`);
    // Placeholder for invite logic
  };

  if (loading) {
    return <div className="p-4 w-[30rem]">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 w-[30rem]">
      <h3 className="text-xl font-semibold mb-4">Your Communities</h3>
      {appUser.communities.length === 0 ? (
        <div>
          <p>You don’t belong to any communities yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {appUser.communities.map((community) => (
            <li key={community.id} className="border p-4 rounded-md">
              <Link href={`/communities/${community.id}`}>
                <h4 className="text-lg font-medium">{community.name}</h4>
                <p className="text-muted-foreground">{community.id}</p>
                <p className="text-muted-foreground">{community.description}</p>
              </Link>
              <Button
                onClick={() => handleInvite(community.id)}
                className="mt-2"
                variant="outline"
              >
                Invite
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}