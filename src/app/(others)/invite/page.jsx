'use client';

import React from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First Name must be at least 2 characters." })
    .max(30, { message: "First Name must not be longer than 30 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters." })
    .max(30, { message: "Last Name must not be longer than 30 characters." }),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number (e.g., +12345678901)." })
    .min(10, { message: "Phone Number must be at least 10 digits." })
    .max(15, { message: "Phone Number must not exceed 15 characters." }),
});

const defaultValues = {
  firstName: "Josh",
  lastName: "McCarty",
  phoneNumber: "12708831110", // Will need to be "+12709858824" with updated schema
};

export default function Invite(props) {
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
        body: JSON.stringify({ phoneNumber: data.phoneNumber, firstName: data.firstName, lastName: data.lastName }),
      });

      const text = await res.text(); // Get raw text first
      console.log('Raw response:', text); // Debug

      const result = JSON.parse(text); // Manually parse
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

  function onSubmit(data) {
    sendInvite(data); // Call sendInvite with form data
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto border-r border-l">
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Invite to Organization</h2>
      </div>
      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormDescription>Add the first name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormDescription>Add the last name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+12345678901" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add the mobile phone number (include country code, e.g., +1 for USA).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Invite"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}