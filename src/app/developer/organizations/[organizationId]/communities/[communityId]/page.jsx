"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteCommunity, getCommunityById } from "@/lib/actions/community"; // New action to fetch a single community
import { MembersTable } from "./members-table";
import { Button } from "@/components/ui/button";
import {
  addCommunityToUser,
  getCommunityMembers,
  removeCommunityFromUserByMembershipId,
  searchUsersInOrganization
} from "@/lib/actions/user";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityMembersPage() {
  const params = useParams();
  const { organizationId, communityId } = params;
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added for delete confirmation

  const { toast } = useToast();

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMembers()
    }
  }, [communityId]);

  async function fetchCommunity() {
    try {
      const communityData = await getCommunityById(communityId);
      // console.log('community data', communityData);

      if (communityData) {
        setCommunity(communityData);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Community not found",
        });
      }
    } catch (error) {
      console.error("Error fetching community:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch community",
      });
    }
  }

  async function fetchMembers() {
    try {
      const memberData = await getCommunityMembers(communityId);
      // console.log('member data', memberData);

      if (memberData) {
        setMembers(memberData.data || []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Members not found",
        });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch members",
      });
    }
  }

  const handleDeleteCommunity = async () => {
    try {
      const response = await deleteCommunity(communityId);

      if (response?.success) {
        router.push(`/developer/organizations/${organizationId}`); // Redirect after deletion
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to delete organization",
        });
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete organization",
      });
    }
  };

  if (!communityId) {
    return <div className={'md:w-[30rem]'}>Loading...</div>;
  }

  const handleMemberRemoved = async (memberId) => {
    try {
      const response = await removeCommunityFromUserByMembershipId(communityId, memberId);
      if (response?.success) {
        fetchMembers();
        toast({
          title: "Success",
          description: "Member removed from community",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to remove member",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      });
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      // console.log('searching',organizationId, query)
      const results = await searchUsersInOrganization(organizationId, query);
      // console.log(results);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users",
      });
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const response = await addCommunityToUser(communityId, userId);

      if (response?.success) {
        fetchMembers();
        setDialogOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        toast({
          title: "Success",
          description: "Member added to community",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to add member",
        });
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add member",
      });
    }
  };

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { href: "/developer/organizations", label: "Organizations" },
    { href: `/developer/organizations/${organizationId}`, label: "Communities" },
    { label: `Members` }, // Last item, no href
  ];

  return (
    <div className="">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">
            Members of {community?.name || "Community"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage members for community ID: {communityId}
          </p>
        </div>

        <div className="space-x-2 flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/*<DropdownMenuItem onClick={() => console.log("Edit community")}>*/}
              {/*  Edit Community*/}
              {/*</DropdownMenuItem>*/}
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                Delete Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setDialogOpen(true)}>New Member</Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Search for a user within the organization to add to this community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddMember(user.id)}
                    >
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.length < 2 ? "Type at least 2 characters to search." : "No users found."}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <MembersTable
        communityId={communityId}
        members={members}
        onMemberRemoved={handleMemberRemoved}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {community?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCommunity}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}