"use client";

import { useState, useEffect } from "react";
import MemberList from "@/components/MemberList.jsx";
import {getCommunityMembers, removeCommunityFromUser} from "@/lib/actions/user.js";
import {useAppUser} from "@/hooks/useAppUser.js";
import { useRouter } from 'next/navigation';
import {useApiToast} from "@/lib/utils.js";


export default function CommunityContextSidebarComponent({ community, communityId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {appUser} = useAppUser();
  const router = useRouter();
  const { showResponseToast, showErrorToast } = useApiToast();

  useEffect(() => {
    async function fetchMembers() {
      try {
        if (!communityId) {
          setLoading(false);
          return;
        }

        const membersResponse = await getCommunityMembers(communityId);

        if (!membersResponse.success) {
          console.error(membersResponse.error);
          setError(membersResponse.error);
        } else {
          setMembers(membersResponse.data || []);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError(err.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [communityId]);

  const onLeave12 = async () => {
    const isConfirmed = window.confirm("Are you sure you want to leave this community?");

    if (isConfirmed) {
      const removalResponse = await removeCommunityFromUser(communityId, appUser.id);

      if(removalResponse.success) {
        window.location.href = "/home";
        showResponseToast(removalResponse);
      } else {
        showErrorToast(removalResponse.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-medium">Loading Community Members</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-medium">Error</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex-1 overflow-auto">
        <MemberList community={community} members={members} />

        <div className="flex justify-center w-full pt-3">
          <button onClick={() => onLeave12()} className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200">
            Leave 12
          </button>
        </div>
      </div>
    </div>
  );
}