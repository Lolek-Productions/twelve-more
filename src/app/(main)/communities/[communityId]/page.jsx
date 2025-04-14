"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppUser } from "@/hooks/useAppUser.js";
import { getCommunityById, updateCommunity } from "@/lib/actions/community.js";
import Link from "next/link";
import { Button } from "@/components/ui/button.jsx";
import MembersCardList from "@/components/MembersCardList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HiPencil } from "react-icons/hi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(50, { message: "Name must be less than 50 characters" }),
  purpose: z.string().min(10, { message: "Purpose must be at least 10 characters" }).max(500, { message: "Purpose must be less than 500 characters" }),
  visibility: z.enum(["public", "private"], {
    required_error: "Please select a visibility option",
  })
});

export default function CommunityPage() {
  const params = useParams();
  const { communityId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { appUser } = useAppUser();
  const [community, setCommunity] = useState({});

  // State for the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      purpose: "",
      visibility: "public"
    }
  });

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }
    async function fetchCommunityData() {
      setLoading(true);
      try {
        const communityData = await getCommunityById(communityId);

        if (!communityData.success) {
          console.error("Community not found");
        } else {
          setCommunity(communityData.community);
          // Initialize the form with current values
          form.reset({
            name: communityData.community.name,
            purpose: communityData.community.purpose,
            visibility: communityData.community.visibility || "private"
          });
        }
      } catch (err) {
        console.error("Failed to fetch community data");
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityData();

  }, [communityId, form]);

  // Check if user is an admin or has edit permissions
  // Check if user is a leader of the community
  const canEditCommunity = () => {
    if (!appUser || !community || !communityId) return false;

    // Find the user's membership in this specific community
    const communityMembership = appUser.communities?.find(
      (membership) => membership.id === communityId
    );

    // Check if the user has a leader role in this community
    return communityMembership?.role === 'leader';
  };

  const handleEditModalOpen = () => {
    // Reset form with current community values
    form.reset({
      name: community.name,
      purpose: community.purpose,
      visibility: community.visibility || "private"
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // Assuming you have an updateCommunity function in your actions
      const result = await updateCommunity(communityId, {
        name: values.name,
        purpose: values.purpose,
        visibility: values.visibility
      });

      if (result.success) {
        // Update the local state with the new values
        setCommunity((prev) => ({
          ...prev,
          name: values.name,
          purpose: values.purpose,
          visibility: values.visibility
        }));
        setIsEditModalOpen(false);
      } else {
        setError("Failed to update community");
      }
    } catch (err) {
      console.error("Error updating community:", err);
      setError("An error occurred while updating the community");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200 flex justify-between items-center">
        <Link href={`/communities/${community.id}/posts`}>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Community: {community?.name}</h2>
            <h2 className="">Purpose: {community?.purpose}</h2>
          </div>
        </Link>

        {canEditCommunity() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditModalOpen}
            className="flex items-center gap-1"
          >
            <HiPencil className="h-4 w-4" /> Edit
          </Button>
        )}
      </div>

      <div className='mt-3 p-5'>
        <Button asChild>
          <Link href={`/communities/${community.id}/posts`}>Go to Posts</Link>
        </Button>
      </div>

      <div>
        <MembersCardList community={community} />
      </div>

      {/* Edit Community Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Community name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of your community
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this community"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What this community is about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public communities can be seen and joined by anyone.
                      Private communities are invite-only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}