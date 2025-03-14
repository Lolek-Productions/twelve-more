"use client";

import { useState, useEffect } from "react";
import MemberList from "@/components/MemberList.jsx";
import { getCommunityMembers } from "@/lib/actions/user.js";

export default function CommunityContextSidebarComponent({ community, communityId, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Community Members</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Community Members</h2>
        </div>
        <div className="p-4 flex-1">
          <p className="text-red-500">Error loading members: {error}</p>
          {onClose && (
            <button
              className="mt-4 text-primary hover:underline"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Community Members</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <MemberList community={community} members={members} />
      </div>
      {onClose && (
        <div className="p-4 border-t md:hidden">
          <button
            className="text-primary hover:underline"
            onClick={onClose}
          >
            Close Panel
          </button>
        </div>
      )}
    </div>
  );
}