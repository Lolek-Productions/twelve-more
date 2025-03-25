'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './actions.js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React, { useEffect, useState } from "react";
import {getCommunityById} from "@/lib/actions/community.js";
import {addCommunityToUser, addOrganizationToUser, setSelectedOrganizationOnUser} from "@/lib/actions/user.js";

const formSchema = z.object({
  organizationName: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters." })
    .max(50, { message: "Organization name must not exceed 50 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must not exceed 500 characters." })
    .optional()
});

export default function OnboardingComponent() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingCommunityId, setPendingCommunityId] = useState(null);
  const [invitationError, setInvitationError] = useState(null);
  const [communityData, setCommunityData] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      description: "",
    },
  });

  // Check for pending community invitation
  useEffect(() => {
    const checkForInvitation = async () => {
      const storedCommunityId = localStorage.getItem('pendingCommunityJoin');
      if (storedCommunityId) {
        setPendingCommunityId(storedCommunityId);
        try {
          const response = await getCommunityById(storedCommunityId);
          if (response.success) {
            setCommunityData(response.community);
          } else {
            setInvitationError('Could not find any community invitation.');
          }
        } catch (error) {
          console.error('Error fetching community details:', error);
        }
      }
    };

    checkForInvitation();
  }, []);

  const handleJoinCommunity = async () => {
    // console.warn('handleJoinCommunity', pendingCommunityId, communityData.organization.id, user.publicMetadata.userMongoId);

    if (!pendingCommunityId || !user) return;

    setIsJoining(true);
    setError('');

    try {
      const userId = user.publicMetadata.userMongoId;
      await addOrganizationToUser(communityData.organization.id, userId);
      await addCommunityToUser(communityData.id, userId);

      //set the storage to null
      localStorage.removeItem('pendingCommunityJoin');

      //redirect to the community page
      window.location.href = `/communities/${communityData.id}`;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append('organizationName', data.organizationName);
      formData.append('description', data.description || '');

      const res = await completeOnboarding(formData);

      if (res.success) {
        // Show success toast
        toast({
          title: "Success!",
          description: res.message || "Organization created successfully!",
        });

        // Reload user data to reflect organization changes
        await user?.reload();

        // Redirect to home page
        router.push('/home');
      } else {
        // Show error message
        setError(res.error || "Something went wrong. Please try again.");

        toast({
          title: "Error",
          description: res.error || "Failed to create organization.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);

      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different content based on whether there's a pending invitation
  if (pendingCommunityId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <Image
              src="/logo.png"
              alt="TwelveMore"
              className={'mx-auto'}
              width={45}
              height={45}
              priority
            />
            <CardTitle className="text-center text-2xl">Welcome to TwelveMore{user?.firstName ? `, ${user.firstName}` : ''}!</CardTitle>
          </CardHeader>

          <CardContent>
            {invitationError && (<div className="text-center p-4 text-red-500">{invitationError}</div>)}

            {communityData && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2 text-center">Community Invitation Found!</h3>
                  <p className="text-blue-800 mb-3">
                    You&#39;ve been invited to join{' '}
                    <span className="font-semibold">
                    {communityData?.name || 'a community'}
                  </span>
                    {communityData?.organizationName && ` in ${communityData.organizationName}`}
                  </p>

                  {communityData?.description && (
                    <p className="text-sm text-blue-700 mt-2 mb-3">
                      &#34;{communityData.description}&#34;
                    </p>
                  )}

                  <p className="text-sm text-blue-600">
                    Joining will connect you to this community.
                  </p>
                </div>

                <Button
                  onClick={handleJoinCommunity}
                  className="w-full"
                  size="lg"
                  disabled={isJoining}
                >
                  {isJoining ? "Joining Community..." : "Accept Invitation"}
                </Button>
              </>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // Just clear the pending invitation so they can create their own org
                  localStorage.removeItem('pendingCommunityJoin');
                  setPendingCommunityId(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Create my own organization
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular onboarding flow (no invitation)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Image
            src="/logo.png"
            alt="TwelveMore"
            className={'mx-auto'}
            width={45}
            height={45}
            priority
          />
          <CardTitle className="text-center text-2xl">Welcome to TwelveMore{user?.firstName ? `, ${user.firstName}` : ''}!</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-6 text-center text-gray-600">
            Let&#39;s get started with the name of your first organization. It could be a church, a school, or some other type of organization.
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Organization Name Field */}
              <FormField
                control={form.control}
                name="organizationName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your organization name" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your organization"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {/* Error message */}
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              <div className="mb-6 text-center text-gray-600">
                After you create your organization, a community will be created as your welcoming community so that everyone who is invited to your organization will have a welcoming place to land.
              </div>

              <Button
                type="submit"
                className="mt-6 w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Getting Started..." : "Get Started"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}