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
import { Textarea } from "@/components/ui/textarea";
import { createOrganizationWithWelcomingCommunity } from "@/lib/actions/organization.js";
import { useRouter } from 'next/navigation';
import { useApiToast } from "@/lib/utils";
import { useState } from "react";
import {useMainContext} from "@/components/MainContextProvider.jsx";

const organizationFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Organization name must be at least 3 characters.",
    })
    .max(50, {
      message: "Organization name must not be longer than 50 characters.",
    }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must not be longer than 500 characters.",
    }),
});

const defaultValues = {
  name: "",
  description: "",
};

export default function NewOrganizationPage() {
  const { appUser } = useMainContext();
  const router = useRouter();
  const { showResponseToast, showErrorToast } = useApiToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    // console.log("Organization data submitted:", data);

    try {
      setIsSubmitting(true);
      const response = await createOrganizationWithWelcomingCommunity(data, appUser.id);

      showResponseToast(response);

      if (response.success) {
        // Get the new organization ID from the response
        const newOrgId = response.organization?.id;

        if (newOrgId) {
          window.location.href = `/organizations/${newOrgId}`;
        } else {
          showErrorToast(response.message);
        }
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
          <h2 className='text-lg sm:text-xl font-bold'>Create a New Organization</h2>
        </div>
        <div className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Organization Name */}
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Organization" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of your organization. It should be unique and
                      descriptive.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Organization Description */}
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about the description of your organization..."
                        className="resize-none"
                        rows="6"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the description of your organization.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </Form>
        </div>
      </>
  );
}