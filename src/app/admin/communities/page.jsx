"use client";

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useEffect, useState } from "react";
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
  createOrUpdateCommunity,
  deleteCommunity,
  getCommunities,
  addUserToCommunity,
} from "@/lib/actions/community";
import { getUsers } from "@/lib/actions/user";
import { CommunityTable } from "@/app/admin/communities/community-table";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const communitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
});

const addUserSchema = z.object({
  userId: z.string().min(1, "User selection is required"),
});

export default function AdminCommunitiesPage() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [users, setUsers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  async function fetchData() {
    const communities = await getCommunities();
    setData(communities);
  }

  async function fetchUsers() {
    const response = await getUsers();
    if (response.success) {
      setUsers(response.users); // Expects [{ id, name }, ...]
    } else {
      toast({ variant: "destructive", title: "Error", description: response.error });
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
      console.log(error);
    }
  };

  const createForm = useForm({
    resolver: zodResolver(communitySchema),
  });

  const addUserForm = useForm({
    resolver: zodResolver(addUserSchema),
  });

  const onCreateSubmit = async (formData) => {
    const response = await createOrUpdateCommunity(formData);
    setServerResponse(response);
    if (response?.success) {
      setModalOpen(false);
      createForm.reset();
      fetchData();
      toast({ title: "Success", description: response.success });
    } else {
      toast({ variant: "destructive", title: "Error", description: response.error });
    }
  };

  const onAddUserSubmit = async (formData) => {
    const response = await addUserToCommunity(selectedCommunityId, formData.userId);
    if (response.success) {
      setAddUserModalOpen(false);
      addUserForm.reset();
      fetchData();
      toast({ title: "Success", description: response.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: response.error });
    }
  };

  const handleAddUser = (communityId) => {
    setSelectedCommunityId(communityId);
    setAddUserModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Communities</h3>
          <p className="text-sm text-muted-foreground">
            Manage your TwelveMore communities.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Community</Button>
      </div>
      <div className="mt-3">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Community</DialogTitle>
              <DialogDescription>
                This community will be a place where people within the given organization can come together.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Community Name"
                defaultValue="Best Community Yet"
                {...createForm.register("name")}
              />
              {serverResponse?.error && <p className="text-red-500 text-sm">{serverResponse.error}</p>}
              {serverResponse?.success && <p className="text-green-500 text-sm">{serverResponse.success}</p>}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Community</DialogTitle>
              <DialogDescription>
                Select a user to add directly to this community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">User</label>
                <Select onValueChange={(value) => addUserForm.setValue("userId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addUserForm.formState.errors.userId && (
                  <p className="text-red-500 text-sm">{addUserForm.formState.errors.userId.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddUserModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <CommunityTable data={data} deleteEntity={deleteEntity} onAddUser={handleAddUser} />
      </div>
    </div>
  );
}