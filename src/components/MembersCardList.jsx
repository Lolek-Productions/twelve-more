"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import {
  deleteCommunities,
  getCommunitiesByUser
} from '@/lib/actions/community';
import {
  addCommunityToUser, changeRoleOnUserInCommunity,
  getCommunityMembers,
  getUsersByCommunityId,
  removeCommunityFromUser,
  updateUserRole
} from '@/lib/actions/user';
import { useToast } from "@/hooks/use-toast.js";
import { useApiToast } from "@/lib/utils.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function MembersCardList({community}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useAppUser();
  const { toast } = useToast();
  const { showResponseToast, showErrorToast } = useApiToast();

  const fetchMembers = async () => {
    if (!appUser || !community) return;
    try {
      setLoading(true);
      const membersData = await getCommunityMembers(community.id);
      // console.log(membersData);
      setMembers(membersData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [appUser, community]);

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

  async function handleRemoveCommunityFromUser(communityId, memberId) {
    if (!appUser?.id) {
      return;
    }
    try {
      const response = await removeCommunityFromUser(communityId, memberId);

      if (!response.success) {
        return console.error(response.message);
      }

      showResponseToast(response);
      await fetchMembers();
      location.reload();
    } catch (error) {
      console.error(error);
      showErrorToast(error)
    }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      const result = await changeRoleOnUserInCommunity(userId, community.id, newRole);

      if (!result.success) {
        return showErrorToast(result.message)
      }
      showResponseToast(result);

      await fetchMembers();
    } catch (error) {
      console.error(error);
      showErrorToast(error)
    }
  }

  const isUserInCommunity = (communityId) => appUser?.communities?.some((c) => c.id === communityId) || false;

  const isCommunityLeader = () => {
    return appUser?.communities?.some(
      (c) => c.id === community.id && c.role === "leader"
    ) || false;
  };

  if (loading) return <div className="p-4 w-full">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      {members?.length === 0 ? (
        <p>No members exist in this community yet.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            return (
              <div key={member.id} className="border px-4 py-2 rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors">
                <Link href={`/profile/${member.id}`} className="flex items-center gap-2 flex-grow">
                  {member.avatar && (
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-medium">
                      {member.firstName} {member.lastName}
                    </h4>
                    Role: {member.role}
                  </div>
                </Link>

                {/* Only show dropdown if current user is a leader */}
                {isCommunityLeader() && member.id !== appUser.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === "leader" ? (
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                          Make Member
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, "leader")}>
                          Make Leader
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleRemoveCommunityFromUser(community.id, member.id)}>
                        Remove from Community
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}