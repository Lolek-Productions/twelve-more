"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils"
// import { toast } from "@/src/hooks/use-toast"
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
import {useEffect, useState} from "react";
import {useToast} from "@/hooks/use-toast";

const profileFormSchema = z.object({
  firstname: z.string().min(2).max(30),
  lastname: z.string().min(2).max(30),
  email: z.string().email(),
  bio: z.string().max(160).min(4),
})

export function UserProfileForm() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Fetched User:", userData);

          // ✅ Populate form with user data
          form.reset({
            firstname: userData.firstName || "",
            lastname: userData.lastName || "",
            email: userData.email || "",
            bio: userData.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, user]);


  const updateUser = async (userData) => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      console.log('✅ User updated successfully:', updatedUser);
    } catch (error) {
      console.error('❌ Error updating user:', error);
    }
  };

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

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  function onSubmit(data) {
    console.log(user?.publicMetadata?.userMongoId);

    updateUser({
      userMongoId: user?.publicMetadata?.userMongoId,
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      bio: data.bio,
    })
      .then(() => {
      // ✅ Show toast only if update is successful
      toast({
        title: "Profile Updated",
        description: "Your Profile has been updated successfully",
      });
    })
      .catch((error) => {
        console.error("❌ Update failed:", error);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your first name
              </FormDescription>
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
              <FormDescription>
                This is your last name
              </FormDescription>
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
              <FormDescription>
                This is your emial address
              </FormDescription>
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
                Tell us about yourself
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
