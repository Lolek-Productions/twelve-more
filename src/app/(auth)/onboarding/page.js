'use client'

import { useUser } from '@clerk/nextjs'
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
import {addCommunityToUser, addOrganizationToUser} from "@/lib/actions/user.js";

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
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [pendingCommunityId, setPendingCommunityId] = useState(null);
  const [invitationError, setInvitationError] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [hasRefreshed, setHasRefreshed] = useState(false); // Track metadata loading status

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      description: "",
    },
  });

  useEffect(() => {
    const checkUserMetadata = async () => {
      if (user && isLoaded) {
        // Check if publicMetadata and specifically userMongoId is loaded
        if (!user.publicMetadata || !user.publicMetadata.userMongoId) {
          try {
            console.log('User metadata not yet loaded, refreshing user...');
            await user.reload();
            console.log('User refreshed:', user);

            // Verify if metadata is now available
            if (user.publicMetadata && user.publicMetadata.userMongoId) {
              console.log('User metadata loaded successfully');
              setHasRefreshed(true);
            } else {
              // If still not available, set up a retry mechanism
              console.log('User metadata still not available after refresh');
              setTimeout(checkUserMetadata, 1000); // Retry after 1 second
            }
          } catch (err) {
            console.error('Failed to reload user:', err);
          }
        } else {
          // Metadata is already available
          console.log('User metadata already loaded:', user.publicMetadata);
          setHasRefreshed(true);
        }
      }
    };

    checkUserMetadata();
  }, [user, isLoaded]);

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
    if (!pendingCommunityId) {
      setError('Pending community ID is missing');
      return;
    }

    if (!user || !user.publicMetadata || !user.publicMetadata.userMongoId) {
      setError('User data is not fully loaded. Please try again.');
      return;
    }

    const userId = user.publicMetadata.userMongoId;

    setIsJoining(true);
    setError('');

    try {
      await addOrganizationToUser(communityData.organization.id, userId);
      await addCommunityToUser(communityData.id, userId);

      // Clear the storage
      localStorage.removeItem('pendingCommunityJoin');

      // Redirect to the community page
      window.location.href = `/communities/${communityData.id}/posts`;
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
      // Check if user metadata is loaded
      if (!user || !user.publicMetadata || !user.publicMetadata.userMongoId) {
        throw new Error('User data is not fully loaded. Please try again.');
      }

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

        // Redirect to home page
        window.location.href = `/home`;
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
      setError(err.message || 'Something went wrong. Please try again.');
      console.error(err);

      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
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
              alt="12More"
              className={'mx-auto'}
              width={45}
              height={45}
              priority
            />
            <CardTitle className="text-center text-2xl">Welcome to 12More{user?.firstName ? `, ${user.firstName}` : ''}!</CardTitle>
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
                  disabled={isJoining || !hasRefreshed || !user?.publicMetadata?.userMongoId}
                >
                  {isJoining ? "Joining Community..." :
                    !hasRefreshed || !user?.publicMetadata?.userMongoId ? "Loading..." : "Accept Invitation"}
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

            {error && (<div className="mt-4 text-center text-red-500">{error}</div>)}
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
            alt="12More"
            className={'mx-auto'}
            width={45}
            height={45}
            priority
          />
          <CardTitle className="text-center text-2xl">Welcome to 12More{user?.firstName ? `, ${user.firstName}` : ''}!</CardTitle>
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
                disabled={isSubmitting || !hasRefreshed || !user?.publicMetadata?.userMongoId}
              >
                {isSubmitting ? "Getting Started..." :
                  !hasRefreshed || !user?.publicMetadata?.userMongoId ? "Loading..." : "Get Started"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}