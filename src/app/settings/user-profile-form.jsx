"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {useEffect} from "react";
import {useToast} from "@/hooks/use-toast";
import {useAppUser} from "@/hooks/useAppUser.js";
import {updateUser} from "@/lib/actions/user.js";

const profileFormSchema = z.object({
  firstname: z.string().min(2, { message: "First name must be at least 2 characters." }).max(30),
  lastname: z.string().min(2, { message: "Last name must be at least 2 characters." }).max(30),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Please enter a valid email address or leave it blank.",
  }),  bio: z.string().max(160, { message: "Bio must not exceed 160 characters." }).optional(), // Can be null, undefined, or a string up to 160 chars
})

export function UserProfileForm() {
  const {appUser} = useAppUser();
  const { toast } = useToast();

  const onUpdateUser = async (formData) => {
    const result = await updateUser({
      id: appUser?.id,
      firstName: formData.firstname,
      lastName: formData.lastname,
      email: formData.email,
      bio: formData.bio,
    })

    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      bio: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (appUser) {
      form.reset({
        firstname: appUser.firstName || "",
        lastname: appUser.lastName || "",
        email: appUser.email || "",
        bio: appUser.bio || "",
      })
    }
  }, [appUser, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onUpdateUser)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="Email Addresss" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Take a minute to tell a story about your life for others to know you a little more.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
