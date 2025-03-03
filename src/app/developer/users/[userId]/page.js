"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CommunitiesTable } from "./communities-table";
import { OrganizationsTable } from "./organizations-table"; // Add this new import
import { Button } from "@/components/ui/button";
import {
  deleteUser,
  getUserById,
  addCommunityToUser,
  removeCommunityFromUserByMembershipId,
  addOrganizationToUser,
  removeOrganizationFromUserByMembershipId,
} from "@/lib/actions/user";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { searchCommunities } from "@/lib/actions/community";
import { searchOrganizations } from "@/lib/actions/organization"; // Add this new import
import { handleApiResponse } from "@/lib/utils";

export default function UsersPage() {
  const params = useParams();
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [organizations, setOrganizations] = useState([]); // Add organizations state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false); // Add organization dialog state
  const [searchQuery, setSearchQuery] = useState("");
  const [orgSearchQuery, setOrgSearchQuery] = useState(""); // Add organization search query
  const [searchResults, setSearchResults] = useState([]);
  const [orgSearchResults, setOrgSearchResults] = useState([]); // Add organization search results
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  async function fetchUser() {
    try {
      const data = await getUserById(userId);
      console.log(data);


      if (data.user) {
        setUser(data.user);
        if (data.user.communities) {
          setCommunities(data.user.communities);
        }
        if (data.user.organizations) {
          setOrganizations(data.user.organizations);
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
    await handleApiResponse({
      apiCall: deleteUser(userId),
      successDescription: "User deleted successfully",
      errorDescription: "Failed to delete user",
      onSuccess: () => router.push(`/developer/users`),
    });
  };

  const handleCommunityRemoved = async (communityMembershipId) => {
    return await handleApiResponse({
      apiCall: removeCommunityFromUserByMembershipId(communityMembershipId, userId),
      successDescription: "User removed from community",
      errorDescription: "Failed to remove community",
      onSuccess: () => fetchUser(),
    });
  };

  const handleOrganizationRemoved = async (organizationMembershipId) => {
    return await handleApiResponse({
      apiCall: removeOrganizationFromUserByMembershipId(organizationMembershipId, userId),
      successDescription: "User removed from organization",
      errorDescription: "Failed to remove organization",
      onSuccess: () => fetchUser(),
    });
  };

  const handleSearchCommunities = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchCommunities(query);
      setSearchResults(results.data || []);
    } catch (error) {
      console.error("Error searching communities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search communities",
      });
    }
  };

  const handleSearchOrganizations = async (query) => { // Add organization search handler
    setOrgSearchQuery(query);
    if (query.length < 2) {
      setOrgSearchResults([]);
      return;
    }
    try {
      const results = await searchOrganizations(query);
      setOrgSearchResults(results.data || []);
    } catch (error) {
      console.error("Error searching organizations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search organizations",
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
      }
    } catch (error) {
      console.error("Error adding community:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add community",
      });
    }
  };

  const handleAddOrganization = async (organizationId) => { // Add organization add handler
    //trying to add org with id:
    console.log(organizationId);

    try {
      const response = await addOrganizationToUser(organizationId, userId);
      if (response?.success) {
        fetchUser();
        setOrgDialogOpen(false);
        setOrgSearchQuery("");
        setOrgSearchResults([]);
        toast({
          title: "Success",
          description: "User added to organization",
        });
      }
      if (!response?.success) {
        console.error("Error adding organization:", response?.error);
      }

    } catch (error) {
      console.error("Error adding organization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add organization",
      });
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

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
          <h3 className="text-lg font-medium">User: {user?.firstName}</h3>
          <p className="text-sm text-muted-foreground">Id: {user?.id}</p>
          <p className="text-sm text-muted-foreground">ClerkId: {user?.clerkId}</p>
          <p className="text-sm text-muted-foreground">Selected Organization: {user?.selectedOrganization?.id}</p>
          <p className="text-sm text-muted-foreground">Bio: {user?.bio}</p>
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
          <Button onClick={() => setDialogOpen(true)}>Add Community</Button>
        </div>

        {/* Community Dialog */}
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
                onChange={(e) => handleSearchCommunities(e.target.value)}
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

        {/* Organization Dialog */}
        <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Organization to User</DialogTitle>
              <DialogDescription>
                Search for an organization to add this user to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search organizations by name..."
                value={orgSearchQuery}
                onChange={(e) => handleSearchOrganizations(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto">
                {orgSearchResults.length > 0 ? (
                  orgSearchResults.map((organization) => (
                    <div
                      key={organization.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleAddOrganization(organization.id)}
                    >
                      <span>{organization.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {orgSearchQuery.length < 2 ? "Type at least 2 characters to search." : "No organizations found."}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOrgDialogOpen(false)}>
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

      <div className={'flex justify-end mt-7'}>
        <Button onClick={() => setOrgDialogOpen(true)}>Add Organization</Button>
      </div>

      <OrganizationsTable
        userId={userId}
        data={organizations}
        onOrganizationRemoved={handleOrganizationRemoved}
      />
    </div>
  );
}