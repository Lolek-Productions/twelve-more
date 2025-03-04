'use client';

import React, {useEffect, useState} from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {useParams} from "next/navigation";
import {getCommunityById} from "@/lib/actions/community";

// Updated schema to include firstName and lastName
const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required." })
    .max(50, { message: "First name must not exceed 50 characters." }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required." })
    .max(50, { message: "Last name must not exceed 50 characters." }),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number (e.g., +12345678901)." })
    .min(10, { message: "Phone Number must be at least 10 digits." })
    .max(15, { message: "Phone Number must not exceed 15 characters." }),
  smsOptIn: z
    .boolean()
    .refine((val) => val === true, { message: "You must agree to receive SMS notifications." }),
});

const defaultValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  smsOptIn: false,
};

export default function Invite() {
  const params = useParams();
  const communityId = params?.communityId;
  const [community, setCommunity] = useState({});

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  async function fetchCommunity() {
    // console.log('communityId', communityId);
    try {
      const communityData = await getCommunityById(communityId);
      setCommunity(communityData);

    } catch (error) {
      console.error("Error fetching community:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch community",
      });
    }
  }

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const { toast } = useToast();

  const sendInvite = async (data) => {
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Include all fields in the API call
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          communityId: communityId,
        }),
      });

      const text = await res.text();
      console.log('Raw response:', text); // Debug

      const result = JSON.parse(text);
      if (!res.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      toast({
        title: "Invitation Sent",
        description: `An SMS invitation was sent to ${data.phoneNumber}.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data) => {
    sendInvite(data);
  };

  return (
    <div className="min-h-screen max-w-xl mx-auto border-r border-l">
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Invite to {community?.name}</h2>
      </div>
      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name Field */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name Field */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2025550123" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your 10-digit US phone number (no +1 needed).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SMS Opt-in Checkbox */}
            <FormField
              control={form.control}
              name="smsOptIn"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormControl>
                    <Checkbox
                      id="smsOptIn"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel htmlFor="smsOptIn" className="text-sm">
                      I agree to receive SMS notifications from TwelveMore. Message & data rates may apply. Reply STOP to unsubscribe. See our Privacy Policy.
                    </FormLabel>
                    <FormDescription className="text-sm">
                      Message & data rates may apply. Reply <strong>STOP</strong> to unsubscribe. See our{" "}
                      <Link target="_blank" href="/privacy" className="text-blue-500 hover:underline">
                        Privacy Policy
                      </Link>.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div>
              <Button className="mt-5" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Invite"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}