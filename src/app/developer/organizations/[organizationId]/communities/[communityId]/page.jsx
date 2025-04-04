"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteCommunities, getCommunityById, addAllLeadersToCommunitiy } from "@/lib/actions/community";
import { MembersTable } from "./members-table";
import { Button } from "@/components/ui/button";
import {
  addCommunityToUser,
  getCommunityMembers,
  removeCommunityFromUserByMembershipId,
  searchUsersInUserOrganizations
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function CommunityMembersPage() {
  const params = useParams();
  const { organizationId, communityId } = params;
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addLeadersDialogOpen, setAddLeadersDialogOpen] = useState(false); // New state for add leaders dialog
  const [isAddingLeaders, setIsAddingLeaders] = useState(false); // Loading state

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
      if (communityData.success) {
        setCommunity(communityData.community);
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
      const response = await deleteCommunities(communityId);

      if (response?.success) {
        router.push(`/developer/organizations/${organizationId}`);
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

  // New handler for adding all leaders
  const handleAddAllLeaders = async () => {
    setIsAddingLeaders(true);
    try {
      const response = await addAllLeadersToCommunitiy(organizationId, communityId);

      if (response?.success) {
        fetchMembers(); // Refresh the members list
        toast({
          title: "Success",
          description: response.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.message || "Failed to add leaders",
        });
      }
    } catch (error) {
      console.error("Error adding leaders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add leaders",
      });
    } finally {
      setIsAddingLeaders(false);
      setAddLeadersDialogOpen(false);
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
      const results = await searchUsersInUserOrganizations(organizationId, query);
      setSearchResults(results.users || []);
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
              <DropdownMenuItem onClick={() => setAddLeadersDialogOpen(true)}>
                Add All Community Leaders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                Delete Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setDialogOpen(true)}>New Member</Button>
        </div>

        {/* Add Member Dialog */}
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

        {/* New Add All Leaders Dialog */}
        <AlertDialog open={addLeadersDialogOpen} onOpenChange={setAddLeadersDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add All Community Leaders</AlertDialogTitle>
              <AlertDialogDescription>
                This will add all users who are leaders in any community within this organization to this community.
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isAddingLeaders}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAddAllLeaders}
                disabled={isAddingLeaders}
              >
                {isAddingLeaders ? "Adding Leaders..." : "Add All Leaders"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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