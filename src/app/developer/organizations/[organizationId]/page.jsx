"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCommunitiesByOrganization, createCommunity } from "@/lib/actions/community";
import {deleteOrganization, getOrganizationById, setWelcomingCommunity} from "@/lib/actions/organization";
import { CommunityTable } from "./community-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useApiToast} from "@/lib/utils.js";

export default function DeveloperCommunitiesPage() {
  const params = useParams();
  const organizationId = params?.organizationId;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added for delete confirmation
  const [communities, setCommunities] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const { showResponseToast, showErrorToast } = useApiToast();

  useEffect(() => {
    if (organizationId) {
      fetchCommunities();
    }
  }, [organizationId]);

  async function fetchCommunities() {
    try {
      const communitiesData = await getCommunitiesByOrganization(organizationId);

      if (Array.isArray(communitiesData) && communitiesData.length > 0) {
        setCommunities(communitiesData);
        setOrganizationName(communitiesData[0].organization?.name || "Unknown Organization");
      } else {
        const organization = await getOrganizationById(organizationId);
        setCommunities([]);
        setOrganizationName(organization?.name || "Unknown Organization");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
      setOrganizationName("Unknown Organization");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch communities",
      });
    }
  }

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) {
      showErrorToast("Community name is required")
      return;
    }

    try {
      const response = await createCommunity({
        name: newCommunityName,
        organizationId: organizationId,
      });

      console.log(response);

      if (response?.success) {
        setNewCommunityName("");
        setDialogOpen(false);
        fetchCommunities(); // Refresh the community list
        showResponseToast(response)
      } else {
        showErrorToast(response?.message)
      }
    } catch (error) {
      console.error("Error creating community:", error);
      showErrorToast(error)
    }
  };

  const handleSetWelcomingCommittee = async (communityId) => {
    try {
      const response = await setWelcomingCommunity(organizationId, communityId);
      showResponseToast(response);
    } catch (error) {
      console.error("Error updating organization:", error);
      showErrorToast(error);
    }
  }

  const handleDeleteOrganization = async () => {
    try {
      const response = await deleteOrganization(organizationId);

      if (response?.success) {
        router.push("/developer/organizations");
      } else {
        showResponseToast(response);
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      showErrorToast(error);
    }
  };

  if (!organizationId) {
    return <div>Loading...</div>;
  }

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { href: "/developer/organizations", label: "Organizations" },
    { label: `Communities` }, // Last item, no href
  ];

  return (
    <div className="">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Communities in {organizationName}</h3>
          <p className="text-sm text-muted-foreground">
            Organization ID: {organizationId}
          </p>
        </div>
        <div className="space-x-2 flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/*<DropdownMenuItem onClick={() => console.log("Edit organization")}>*/}
              {/*  Edit Organization*/}
              {/*</DropdownMenuItem>*/}
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                Delete Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setDialogOpen(true)}>New Community</Button>
        </div>
      </div>

      <CommunityTable
        data={communities}
        deleteEntity={(id) => console.log("Delete community", id)}
        onManageMembers={(community) => console.log("Manage members for", community)}
        handleSetWelcomingCommittee={handleSetWelcomingCommittee}
      />

      {/*Create a new community*/}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
            <DialogDescription>
              Add a new community to {organizationName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Community Name"
              value={newCommunityName}
              onChange={(e) => setNewCommunityName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCommunity}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {organizationName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrganization}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}