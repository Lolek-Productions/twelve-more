"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, getUserById } from "@/lib/actions/user"; // New action to fetch a single community
import { CommunitiesTable } from "./communities-table";
import { Button } from "@/components/ui/button";
import {
  addCommunityToUser,
  removeCommunityFromUser,
  addOrganizationToUser,
  removeOrganizationFromUser,
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
import {searchCommunities} from "@/lib/actions/community"

export default function UsesrsPage() {
  const params = useParams();
  const { userId} = params;
  const [user, setUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [organization, setOrganizations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added for delete confirmation
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  async function fetchUser() {
    try {
      // console.log('userId', userId);
      const data = await getUserById(userId);

      if (data.user) {
        setUser(data.user);
        // console.log(data.user)
        if(data.user.communities){
          setCommunities(data.user.communities)
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user",
      });
    }
  }

  const handleDeleteUser = async () => {
    try {
      const response = await deleteUser(communityId);

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

  if (!userId) {
    return <div>Loading...</div>;
  }

  const handleCommunityRemoved = async (communityId) => {
    // console.log(communityId, userId);

    try {
      const response = await removeCommunityFromUser(communityId, userId);
      if (response?.success) {
        fetchUser();
        toast({
          title: "Success",
          description: "User removed from community",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to remove community",
        });
      }
    } catch (error) {
      console.error("Error removing community:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove community",
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
      // console.log('searching',userId, query)
      const results = await searchCommunities(query);
      // console.log(results);
      setSearchResults(results.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users",
      });
    }
  };

  const handleAddCommunity = async (communityId) => {
    try {
      const response = await addCommunityToUser(communityId, userId);

      if (response?.success) {
        fetchUser();
        setDialogOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        toast({
          title: "Success",
          description: "User added to community",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error || "Failed to add user",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add user",
      });
    }
  };

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { label: "Users" },
  ];

  return (
    <div className="">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">
            User: {user?.firstName}
          </h3>
          <p className="text-sm text-muted-foreground">
            User Bio: {user?.bio}
          </p>
        </div>

        <div className="space-x-2 flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setDialogOpen(true)}>Add Membership to Community</Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Community to User</DialogTitle>
              <DialogDescription>
                Search for a community to add this user to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search communities by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((community) => (
                    <div
                      key={community.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddCommunity(community.id)}
                    >
                      <span>{community.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.length < 2 ? "Type at least 2 characters to search." : "No communities found."}
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

      <CommunitiesTable
        userId={userId}
        data={communities}
        onCommunityRemoved={handleCommunityRemoved}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove From Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this community from {user?.firstName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}