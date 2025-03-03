"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppUser } from '@/hooks/useAppUser';
import Link from "next/link";
import {createCommunity, getCommunitiesByOrganization} from '@/lib/actions/community';
import { addCommunityToUser, removeCommunityFromUser } from '@/lib/actions/user';
import {useToast} from "@/hooks/use-toast.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog.jsx";
import {Input} from "@/components/ui/input.jsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Label} from "@/components/ui/label.jsx";

const communitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
});

export default function CommunitiesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [serverResponse, setServerResponse] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinStatus, setJoinStatus] = useState({});
  const { appUser } = useAppUser();
  const { toast } = useToast();

  const createForm = useForm({
    resolver: zodResolver(communitySchema),
  });

  const fetchCommunities = async () => {
    if (!appUser) return;
    if (!appUser.selectedOrganization?.id) {
      setError('No organization selected');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const orgCommunities = await getCommunitiesByOrganization(appUser.selectedOrganization.id);
      setCommunities(orgCommunities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [appUser]);

  const onCreateSubmit = async (formData) => {
    if (!appUser?.id || !appUser.selectedOrganization?.id) {
      toast({
        title: "Error",
        description: "You must be logged in and have an organization selected to create a community.",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await createCommunity({
        ...formData,
        organizationId: appUser.selectedOrganization.id,
      });
      if (!result.success) {
        setModalOpen(false);
        createForm.reset();
        return toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      toast({
        title: "Community Created",
        description: "Your new community has been created successfully!",
      });
      await fetchCommunities();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create community.",
        variant: "destructive",
      });
    }
  };


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

  async function handleRemoveCommunityFromUser(communityId) {
    if (!appUser?.id) {
      setError('User not logged in');
      return;
    }
    setJoinStatus((prev) => ({ ...prev, [communityId]: { loading: true, error: null } }));
    try {
      await removeCommunityFromUser(communityId, appUser.id);
      toast({
        title: "Community Removed",
        description: `You have been removed from the community!`,
      });
      await fetchCommunities();
      location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  const isUserInCommunity = (communityId) => appUser?.communities?.some((c) => c.id === communityId) || false;

  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:w-[30rem]">

      <Button className="mb-4" onClick={() => setModalOpen(true)}>
        Create New Community
      </Button>

      {communities.length === 0 ? (
        <p>No communities exist in this organization yet.</p>
      ) : (
        <ul className="space-y-4">
          {communities.map((community) => {
            const status = joinStatus[community.id] || {};
            const isMember = isUserInCommunity(community.id);
            return (
              <li key={community.id} className="border p-4 rounded-md">
                <Link href={`/communities/${community.id}`}>
                  <h4 className="text-lg font-medium">{community.name}</h4>
                  <p className="text-muted-foreground">{community.description}</p>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  {!isMember ? (
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => handleAddCommunityToUser(community.id)}
                      disabled={status.loading}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      className="mt-2"
                      variant="outline"
                      onClick={() => handleRemoveCommunityFromUser(community.id)}
                      disabled={status.loading}
                    >
                      Leave
                    </Button>
                  )}
                  <Button asChild className="mt-2" variant="outline">
                    <Link href={`/communities/${community.id}/invite`}>Invite others to community</Link>
                  </Button>
                </div>
                {status.error && <p className="text-red-500 text-sm mt-1">{status.error}</p>}
                {status.success && !status.loading && <p className="text-green-500 text-sm mt-1">{status.success}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
            <DialogDescription>
              This community will be a place where people within the given organization can come together.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Label htmlFor="name">Name</Label>
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
    </div>
  );
}
