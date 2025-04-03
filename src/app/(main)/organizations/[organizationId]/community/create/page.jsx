"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCommunity } from "@/lib/actions/community.js";
import { useAppUser } from "@/hooks/useAppUser.js";
import { useRouter } from 'next/navigation';
import { useApiToast } from "@/lib/utils";
import {useEffect, useState} from "react";
import {getUsers} from "@/lib/actions/user.js";
import {getOrganizationById} from "@/lib/actions/organization.js";
import {useParams} from "next/navigation.js";

const communityFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Community name must be at least 3 characters.",
    })
    .max(50, {
      message: "Community name must not be longer than 50 characters.",
    }),
  purpose: z
    .string()
    .min(10, {
      message: "Purpose must be at least 10 characters.",
    })
    .max(500, {
      message: "Purpose must not be longer than 500 characters.",
    }),
  visibility: z
    .string({
      required_error: "Please select a visibility option.",
    })
    .refine((val) => ["public", "private"].includes(val), {
      message: "Visibility must be 'public' or 'private'.",
    }),
});

const defaultValues = {
  name: "",
  purpose: "",
  visibility: "public", //public or private
};

export default function NewCommunityPage() {
  const { appUser } = useAppUser();
  const router = useRouter();
  const { showResponseToast, showErrorToast } = useApiToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organization, setOrganization] = useState(false);
  const params = useParams();
  const { organizationId } = params;

  useEffect(() => {
    if (!organizationId) {
      return;
    }
    async function fetchOrganizationData() {
      try {
        const orgData = await getOrganizationById(organizationId);
        if (orgData.success) {
          setOrganization(orgData.organization);
        }
      } catch (error) {
        showErrorToast(error);
      }
    }
    fetchOrganizationData();
  }, [organizationId]);

  const form = useForm({
    resolver: zodResolver(communityFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createCommunity({ ...data, userId: appUser.id, organizationId: organizationId });
      showResponseToast(response);
      if (response.success) {
        window.location.href = `/communities/${response.community.id}/posts`;
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>Create a New Community within {organization?.name}</h2>
      </div>
      <div className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Community Name */}
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Community Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Community" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your community. It should be unique and
                    descriptive.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {/* Community Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about the purpose of your community..."
                      className="resize-none"
                      rows="6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the purpose of your community.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {/* Community Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose who can see and join your community:{" "}
                    <span className="block">Public: Anyone can view and join.</span>
                    <span className="block">Private: Only invited members can view and join.</span>
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}