"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { getRecentPostCommunities } from "@/lib/actions/post.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function CommunitySelector() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { appUser } = useMainContext();

  const fetchCommunities = async () => {
    if (communities.length === 0 && !loading) {
      try {
        setLoading(true);

        // Call the server action directly
        const result = await getRecentPostCommunities(appUser.id, 5);

        if (result.success) {
          setCommunities(result.communities);
        }
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommunitySelect = (communityId) => {
    router.push(`/communities/${communityId}/posts`);
  };

  return (
    <DropdownMenu onOpenChange={fetchCommunities}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="mt-2 w-full text-gray-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center"
        >
          Post to your 12
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Recent Communities</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : communities.length === 0 ? (
          <DropdownMenuItem disabled>No recent communities</DropdownMenuItem>
        ) : (
          communities.map((community) => (
            <DropdownMenuItem
              key={community.id}
              onClick={() => handleCommunitySelect(community.id)}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{community.name}</span>
                <span className="text-xs text-gray-500">{community.organization.name}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/organizations')}
          className="text-blue-600 cursor-pointer"
        >
          View all communities
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}