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
import {createCommunity} from "@/lib/actions/community.js";
import {useAppUser} from "@/hooks/useAppUser.js";
import { useRouter } from 'next/navigation'
import {useToast} from "@/hooks/use-toast.js";

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
  visibility: "public", //public or private
};

export default function NewCommunityPage() {
  const {appUser} = useAppUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(communityFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    console.log("Community data submitted:", data);

    const response = await createCommunity(data, appUser)

    if(!response.success) {
      toast({
        title: "Error",
        description: `${response.error}`,
      });

      return console.error(response.error);
    }

    router.push('/communities')
  }

  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>Create a New Community</h2>
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
              <Button type="submit">Create Community</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}