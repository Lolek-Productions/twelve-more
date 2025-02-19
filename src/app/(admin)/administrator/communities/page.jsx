'use client'

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
  DialogTitle
} from "@/components/ui/dialog";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createOrUpdateCommunity, deleteCommunity, getCommunities} from "@/lib/actions/community";
import {CommunityTable} from "@/app/(admin)/administrator/communities/community-table";
import { useToast } from "@/hooks/use-toast"
import {error} from "next/dist/build/output/log";

const communitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
});

export default function AdminCommunitiesPage() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const { toast } = useToast()

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const communities = await getCommunities();
    setData(communities);
  }

  const deleteEntity = (id) => {
    try {
      deleteCommunity(id)
      toast({
        title: "Community Deleted",
        description: "The community has been deleted successfully.",
      })
      fetchData();
    } catch (error) {
      console.log(error)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(communitySchema),
  });

  // ✅ Handle form submission
  const onSubmit = async (formData) => {
    console.log('submitting:', formData);

    const response = await createOrUpdateCommunity(formData);
    setServerResponse(response);

    if (response?.success) {
      setModalOpen(false); // ✅ Close modal on success
      reset(); // ✅ Reset form fields
      fetchData();
    }
  };

  return (
    <div className="">
      <div className='flex flex-row items-center justify-between'>
        <div>
          <h3 className="text-lg font-medium">Communities</h3>
          <p className="text-sm text-muted-foreground">
            Stuff about the Community
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
              <Button onClick={() => setModalOpen(true)}>New Community</Button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Community</DialogTitle>
              <DialogDescription>
                This community will be a place where people within the given organization can come together and build up
                one another.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Community Name"
                defaultValue="Best Community Yet"
                {...register("name")}
              />
              {serverResponse?.error && <p className="text-red-500 text-sm">{serverResponse.error}</p>}
              {serverResponse?.success && <p className="text-green-500 text-sm">{serverResponse.success}</p>}

              <DialogFooter>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">{"Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <CommunityTable data={data} deleteEntity={deleteEntity} />

      </div>
    </div>
  )
}
