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
import {handleApiResponse} from "@/lib/utils";

export default function UsersPage() {
  const params = useParams();
  const { userId} = params;
  const [user, setUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  // const [organization, setOrganizations] = useState([]);
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
    // console.log('hello handleDeleteUser');
    // return;

    await handleApiResponse({
      apiCall: deleteUser(userId),
      successDescription: "User deleted successfully",
      defaultErrorDescription: "Failed to delete user",
      onSuccess: () => router.push(`/developer/users`),
    });
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  const handleCommunityRemoved = async (communityId) => {
    // console.log(communityId, userId);
      // return;

    return await handleApiResponse({
      apiCall: removeCommunityFromUser(communityId, userId),
      successDescription: "User removed from community",
      defaultErrorDescription: "Failed to remove community",
      onSuccess: () => fetchUser(),
    });
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
    { href: "/developer/users", label: "Users" },
    { label: `${user?.firstName} ${user?.lastName}` },
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
            Id: {user?.id}
          </p>
          <p className="text-sm text-muted-foreground">
            ClerkId: {user?.clerkId}
          </p>
          <p className="text-sm text-muted-foreground">
            Bio: {user?.bio}
          </p>
        </div>

        <div className="space-x-2 flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDeleteUser()}>
                Force Delete User
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

    </div>
  );
}