"use client";

import { useEffect, useState } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCommunity,
  deleteCommunity,
  getCommunitiesByOrganization,
  addUserToCommunity,
  removeUserFromCommunity,
} from "@/lib/actions/community";
import { getOrganizationById } from "@/lib/actions/organizations"; // Assuming this exists
import { searchUsers } from "@/lib/actions/user";
import { CommunityTable } from "@/app/developer/organizations/[organizationId]/communities/community-table";
import { MembersTable } from "@/app/developer/organizations/[organizationId]/communities/members-table";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const communitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
});

export default function AdminCommunitiesPage({ params }) {
  const resolvedParams = React.use(params); // Unwrap params Promise
  const { organizationId } = resolvedParams;

  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  async function fetchData() {
    try {
      const communities = await getCommunitiesByOrganization(organizationId);
      console.log("Communities result:", communities);

      if (Array.isArray(communities) && communities.length > 0) {
        setData(communities);
        setOrganizationName(communities[0].organization?.name || "Unknown Organization");
      } else {
        const organization = await getOrganizationById(organizationId);
        console.log("Fetch organization directly:", organization);

        if (organization) {
          setData([]);
          setOrganizationName(organization.name || "Unknown Organization");
        } else {
          setData([]);
          setOrganizationName("Unknown Organization");
          toast({
            variant: "destructive",
            title: "Warning",
            description: "No organization found",
          });
        }
      }
    } catch (error) {
      console.error("FetchData error:", error);
      setData([]);
      setOrganizationName("Unknown Organization");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch communities",
      });
    }
  }

  const deleteEntity = async (id) => {
    try {
      await deleteCommunity(id);
      toast({
        title: "Community Deleted",
        description: "The community has been deleted successfully.",
      });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete community" });
    }
  };

  const deleteMember = async (memberId) => {
    try {
      await removeUserFromCommunity(selectedCommunity?.id, memberId);
      toast({
        title: "Member Removed",
        description: "The member has been removed from the community.",
      });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove member" });
    }
  };

  const createForm = useForm({
    resolver: zodResolver(communitySchema),
    defaultValues: { name: "" },
  });

  const onCreateSubmit = async (formData) => {
    setServerResponse(null);
    const response = await createCommunity({ name: formData.name, organizationId });
    setServerResponse(response);
    if (response?.success) {
      setModalOpen(false);
      createForm.reset({ name: "" });
      fetchData();
      toast({ title: "Success", description: response.success });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response?.error || "Unknown error",
      });
    }
  };

  const handleManageMembers = (community) => {
    setSelectedCommunity(community);
    setSheetOpen(true);
  };

  const handleSearch = async (event) => {
    const query = event.target.value;
    if (query.length > 2) {
      const response = await searchUsers(query);
      if (response?.success) {
        setSearchResults(response.users || []);
      } else {
        setSearchResults([]);
        toast({ variant: "destructive", title: "Error", description: response?.error || "Search failed" });
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddUser = async (userId) => {
    const response = await addUserToCommunity(selectedCommunity?.id, userId);
    if (response?.success) {
      setAddUserModalOpen(false);
      fetchData();
      toast({ title: "Success", description: "User added to community" });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response?.error || "Failed to add user",
      });
    }
  };

  if (!organizationId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="text-2xl font-bold p-6 mb-3 text-white bg-gray-700 w-full">
        Showing Communities for {organizationName} organization
      </div>
      <div className="flex flex-row items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-medium">Communities</h3>
          <p className="text-sm text-muted-foreground">
            Globally manage the TwelveMore communities.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Community</Button>
      </div>
      <div className="mt-3 px-6">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Community</DialogTitle>
              <DialogDescription>
                This community will be a place where people within {organizationName} can come together.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Community Name"
                {...createForm.register("name")}
              />
              {serverResponse?.error && (
                <p className="text-red-500 text-sm">{serverResponse.error}</p>
              )}
              {serverResponse?.success && (
                <p className="text-green-500 text-sm">{serverResponse.success}</p>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member to {selectedCommunity?.name}</DialogTitle>
              <DialogDescription>Search for a user to add to this community.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input type="text" placeholder="Search users..." onChange={handleSearch} />
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddUser(user.id)}
                  >
                    {user.name}
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <p className="text-sm text-gray-500">No users found</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAddUserModalOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-[75vw] md:w-[50vw]">
            <SheetHeader>
              <SheetTitle>{selectedCommunity?.name} Members</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Button onClick={() => setAddUserModalOpen(true)} className="mb-4">
                Add New Member
              </Button>
              <MembersTable
                community={selectedCommunity || {}}
                deleteMember={deleteMember}
              />
            </div>
          </SheetContent>
        </Sheet>

        <CommunityTable
          data={data}
          deleteEntity={deleteEntity}
          onManageMembers={handleManageMembers}
        />
      </div>
    </div>
  );
}