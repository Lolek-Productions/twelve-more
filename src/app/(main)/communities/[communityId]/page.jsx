"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {useAppUser} from "@/hooks/useAppUser.js";
import {getCommunityById} from "@/lib/actions/community.js";
import Link from "next/link.js";
import {Button} from "@/components/ui/button.jsx";

export default function CommunityPage() {
  const params = useParams();
  const { communityId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { appUser } = useAppUser();
  const [community, setCommunity] = useState({});


  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }
    async function fetchCommunityData() {
      setLoading(true);
      try {
        const communityData = await getCommunityById(communityId);

        if (!communityData.success) {
          console.error("Community not found");
        } else {
          setCommunity(communityData.community);
        }
      } catch (err) {
        console.error("Failed to fetch community data");
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityData();

  }, [communityId]);

  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Community: {community?.name}</h2>
        <h2 className="">Purpose: {community?.purpose}</h2>
      </div>

      <div className='mt-3 p-5'>
        <Button asChild >
          <Link href={`/communities/${community.id}/posts`}>Posts</Link>
        </Button>
      </div>

      {/*<div className="p-3">*/}
      {/*  <h3 className="text-lg font-semibold">Members ({user.communities.length})</h3>*/}
      {/*  {user.communities.length === 0 ? (*/}
      {/*    <p className="text-gray-500">No communities yet.</p>*/}
      {/*  ) : (*/}
      {/*    <div className="mt-2 space-y-2">*/}
      {/*      {user.communities.map((community) => (*/}
      {/*        <div key={community.id} className="px-2 rounded-md flex justify-start items-center">*/}
      {/*          <Link href={`/communities/${community?.id}/posts`}>*/}
      {/*            <p className="text-sm">{`${community?.name}` || "Unknown"}</p>*/}
      {/*          </Link>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}

      {/*  <h3 className="text-lg font-semibold pt-3">Organizations ({user.organizations.length})</h3>*/}
      {/*  {user.organizations.length === 0 ? (*/}
      {/*    <p className="text-gray-500">No organizations yet.</p>*/}
      {/*  ) : (*/}
      {/*    <div className="mt-2 space-y-2">*/}
      {/*      {user.organizations.map((organization) => (*/}
      {/*        <div key={organization.id} className="px-2 rounded-md flex justify-start items-center">*/}
      {/*          <Link href={`/communities/${organization?.id}/posts`}>*/}
      {/*            <p className="text-sm">{`${organization?.name}` || "Unknown"}</p>*/}
      {/*          </Link>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}
    </>
  );
}
