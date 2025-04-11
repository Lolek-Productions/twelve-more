'use client'

import { useUser } from '@clerk/nextjs'
import { completeOnboarding } from './actions.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
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
import { getCommunityById } from "@/lib/actions/community.js";
import { addCommunityToUser, addOrganizationToUser } from "@/lib/actions/user.js";
import { TAG_LINE } from "@/lib/constants.js";

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

  // Community invitation state
  const [pendingCommunityId, setPendingCommunityId] = useState(null);
  const [communityData, setCommunityData] = useState(null);

  // User metadata state - simplified
  const [isUserReady, setIsUserReady] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      description: "",
    },
  });

  // User metadata loading with retry
  useEffect(() => {
    const prepareUser = async () => {
      if (!isLoaded || !user) return;

      // Check if metadata is already available
      if (user.publicMetadata?.userMongoId) {
        setIsUserReady(true);
        return;
      }

      // Try to reload user data to get metadata
      try {
        await user.reload();

        // Check if metadata is now available after reload
        if (user.publicMetadata?.userMongoId) {
          setIsUserReady(true);
        } else {
          // Wait 1.5 seconds before checking again
          console.log('User metadata not available yet, will check again in 1.5 seconds');
          setTimeout(prepareUser, 1500);
        }
      } catch (err) {
        console.error('Failed to reload user:', err);
        // Still retry after error
        setTimeout(prepareUser, 1500);
      }
    };

    prepareUser();

    // Cleanup function to cancel any pending timeouts
    return () => {
      // This would clear any setTimeout that might be pending
      // but we can't access the specific timeout ID from here
      // Just a good practice for useEffect cleanup
    };
  }, [user, isLoaded]);

  // Check for pending community invitation
  useEffect(() => {
    const checkForInvitation = async () => {
      const storedCommunityId = localStorage.getItem('pendingCommunityJoin');
      if (!storedCommunityId) return;

      setPendingCommunityId(storedCommunityId);

      try {
        const response = await getCommunityById(storedCommunityId);
        if (response.success) {
          setCommunityData(response.community);
        }
      } catch (error) {
        console.error('Error fetching community details:', error);
      }
    };

    checkForInvitation();
  }, []);

  const handleJoinCommunity = async () => {
    if (!pendingCommunityId || !isUserReady) return;

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
    if (!isUserReady) {
      setError('User data is not fully loaded yet. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append('organizationName', data.organizationName);
      formData.append('description', data.description || '');

      const res = await completeOnboarding(formData);

      if (res.success) {
        toast({
          title: "Success!",
          description: res.message || "Organization created successfully!",
        });

        window.location.href = `/home`;
      } else {
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

  // Common elements - logo and title
  const headerContent = (
    <CardHeader>
      <Image
        src="/logo.png"
        alt="12More"
        className="mx-auto"
        width={45}
        height={45}
        priority
      />
      <CardTitle className="text-center">
        <div className="text-2xl">
          Welcome to 12More{user?.firstName ? `, ${user.firstName}` : ''}!
        </div>
        <div className="pt-2">{TAG_LINE}</div>
      </CardTitle>
    </CardHeader>
  );

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          {headerContent}
          <CardContent className="flex justify-center">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add a separate loading indicator when user is loaded but metadata isn't ready yet
  if (!isUserReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          {headerContent}
          <CardContent className="flex justify-center">
            <div className="text-center">Give us a minute while we load your data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invitation view if there's a pending invitation
  if (pendingCommunityId && communityData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          {headerContent}
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2 text-center">Community Invitation Found!</h3>
              <p className="text-blue-800 mb-3">
                You have been invited to join{' '}
                <span className="font-semibold">
                  {communityData?.name || 'a community'}
                </span>
                {communityData?.organization?.name && ` in ${communityData.organization.name}`}
              </p>

              {communityData?.description && (
                <p className="text-sm text-blue-700 mt-2 mb-3">
                  {communityData.description}
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
              disabled={isJoining || !isUserReady}
            >
              {isJoining ? "Joining Community..." : "Accept Invitation"}
            </Button>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
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
        {headerContent}
        <CardContent>
          <div className="mb-6 text-center text-gray-600">
            Let us get started with the name of your first organization. It could be a church, a school, or some other type of organization.
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                disabled={isSubmitting || !isUserReady}
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