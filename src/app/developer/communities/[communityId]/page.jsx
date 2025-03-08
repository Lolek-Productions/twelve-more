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
import {updateCommunity, getCommunityById, deleteCommunity} from "@/lib/actions/community.js";
import {useAppUser} from "@/hooks/useAppUser.js";
import {useParams, useRouter} from 'next/navigation'
import {useToast} from "@/hooks/use-toast.js";
import {useEffect, useState} from "react";
import {Breadcrumb} from "@/components/ui/breadcrumb.jsx";

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

// Default values for the form
const defaultValues = {
  name: "",
  purpose: "",
  visibility: "",
};

export default function EditCommunityPage() {
  const {appUser} = useAppUser();
  const[data, setData] = useState({});
  const router = useRouter();
  const params = useParams();
  const communityId = params.communityId;
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(communityFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (formData) => {
    const updatedData = {
      ...formData, // Spread existing formData (id, name, purpose, visibility)
      id: communityId,
    };
    // console.log("Community formData submitted:", updatedData);

    const response = await updateCommunity(updatedData)

    if(!response.success) {
      toast({
        title: "Error",
        description: `${response.error}`,
      });
      return console.error(response.error);
    }

    toast({
      title: "Success",
      description: "Community saved successfully.",
    });
  }

  useEffect(() => {
    if (!communityId) return;

    const fetchCommunity = async () => {
      try {
        const response = await getCommunityById(communityId);
        // console.log(response);

        setData(response);

        form.reset({
          name: response.name || "",
          purpose: response.purpose || "",
          visibility: response.visibility || "",
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const onDeleteCommunity = async () => {
      const response = await deleteCommunity(communityId);
      if(response.success) {
        router.push("/developer/communities")
      }
      console.log('deleting', communityId);
  }

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { href: "/developer/communities", label: `Communities` },
    { label: `${data.name}` },
  ];

  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto'>
        <Breadcrumb items={breadcrumbItems} />
        <div className='py-2 px-3 sticky top-0 z-50 bg-white'>
          <h2 className='text-lg sm:text-xl font-bold'>Edit the Community: {data.name || ''}</h2>
        </div>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={() => {
            if (window.confirm('Are you sure you want to delete this community?')) {
              onDeleteCommunity();
            }
          }}>Delete Community</Button>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <Button type="submit">Save Community</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}