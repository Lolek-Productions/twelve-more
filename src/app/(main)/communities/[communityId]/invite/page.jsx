'use client';

import React, { useEffect, useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useParams } from "next/navigation";
import {getCommunityById} from "@/lib/actions/community";
import {getCommunityMembers, searchUsersInUserOrganizations} from "@/lib/actions/user.js";
import { useAppUser } from "@/hooks/useAppUser.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {useContextContent} from "@/components/ContextProvider.jsx";
import CommunityContextSidebar from "@/components/CommunityContextSidebar.jsx";
import {useApiToast} from "@/lib/utils.js";
import {inviteCurrentUserToCommunity, sendCommunityInvitation} from "@/lib/actions/invite.js";

// User lookup schema
const userLookupSchema = z.object({
  query: z
    .string()
    .min(2, { message: "Search term must be at least 2 characters." })
});

// Profile form schema
const profileFormSchema = z.object({
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
  phoneNumber: "",
  smsOptIn: false,
};

export default function Invite() {
  const params = useParams();
  const communityId = params?.communityId;
  const [community, setCommunity] = useState({});
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [accordionValue, setAccordionValue] = useState("");
  const {appUser} = useAppUser();
  const { showResponseToast, showErrorToast } = useApiToast();

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<CommunityContextSidebar community={community} communityId={communityId} />);
  }, [setContextContent, community, communityId]);

  // Form for the main invite
  const inviteForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Form for the user lookup with auto-search
  const lookupForm = useForm({
    resolver: zodResolver(userLookupSchema),
    defaultValues: { query: "" },
    mode: "onChange",
  });

  // Watch for changes in the query field to trigger auto-search
  const query = lookupForm.watch("query");

  useEffect(() => {
    // Debounce the search to avoid too many requests
    const debounceTimer = setTimeout(() => {
      const currentQuery = lookupForm.getValues("query");
      if (currentQuery && currentQuery.length >= 2) {
        searchUsers({ query: currentQuery });
      }
    }, 300); // 300ms debounce time

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMembers();
    }
  }, [communityId]);

  async function fetchCommunity() {
    try {
      const communityData = await getCommunityById(communityId);
      setCommunity(communityData.community);
    } catch (error) {
      console.error("Error fetching community:", error);
      showErrorToast(error)
    }
  }

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const postData = await getCommunityMembers(communityId);
      if(postData.success) {
        setMembers(postData.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showErrorToast(error)
    } finally {
      setIsLoading(false);
    }
  }

  const searchUsers = async (data) => {
    setIsSearching(true);
    try {
      const result = await searchUsersInUserOrganizations(
        appUser,
        data.query
      );
      if (result.success) {
        setSearchResults(result.users || []);
      } else {
        throw new Error(result.error || 'Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      showErrorToast(e)
    } finally {
      setIsSearching(false);
    }
  };

  async function inviteExistingUser(userId) {
    try {
      const response = await inviteCurrentUserToCommunity(userId, community, appUser);
      showResponseToast(response);
      setShowLookupModal(false);
    } catch (error) {
      console.error(error)
      showErrorToast(error)
    }
  }

  const onSelectUserToInvite = (user) => {
    const result = inviteExistingUser(user.id);
  };

  const createNewUser = () => {
    inviteForm.reset();
    setAccordionValue("invite-form");
  };

  const sendInvite = async (data) => {
    try {
      setIsSubmitting(true);

      const response = await sendCommunityInvitation(data.phoneNumber, community, appUser)
      showResponseToast(response);

      if (response.success) {
        inviteForm.reset();
        setAccordionValue("");
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitInvite = (data) => {
    setIsSubmitting(true);
    try {
      sendInvite(data);
    } catch (error) {
      showErrorToast(e)
      console.error('Error in submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-40 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Invite to {community?.name}</h2>
      </div>

      <div className="p-5">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Community Members</h3>
            <p className="text-sm text-gray-500">
              Current members: {members?.length || 0}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowLookupModal(true);
              setAccordionValue("")
              lookupForm.reset();
            }}
          >
            Look Up User to Invite
          </Button>
        </div>

        {/* Accordion for the invite form */}
        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="mb-6"
        >
          <AccordionItem value="invite-form" className="border rounded-md">
            <AccordionTrigger className="px-4">
              <span className="text-md font-medium">
                Invite New Member
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
                  <FormField
                    control={inviteForm.control}
                    name="phoneNumber"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2025550123" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your 10-digit US phone number (no +1 needed).
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={inviteForm.control}
                    name="smsOptIn"
                    render={({field}) => (
                      <FormItem className="flex items-start space-x-4">
                        <FormControl>
                          <Checkbox
                            id="smsOptIn"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-5"
                          />
                        </FormControl>
                        <div>
                          <FormLabel htmlFor="smsOptIn" className="text-sm">
                            I agree to receive SMS notifications from TwelveMore.
                          </FormLabel>
                          <FormDescription className="text-sm">
                            Message & data rates may apply. Reply <strong>STOP</strong> to unsubscribe. See our{" "}
                            <Link target="_blank" href="/privacy" className="text-blue-500 hover:underline">
                              Privacy Policy
                            </Link>.
                          </FormDescription>
                          <FormMessage/>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Invite"}
                    </Button>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>

      {/* User Lookup Modal */}
      <Dialog open={showLookupModal} onOpenChange={setShowLookupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search for existing users</DialogTitle>
            <DialogDescription>
              Check if the user already exists before sending an invite.
            </DialogDescription>
          </DialogHeader>

          <Form {...lookupForm}>
            <div className="space-y-4 py-4">
              <FormField
                control={lookupForm.control}
                name="query"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Search by name, email or phone</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input {...field} placeholder="Type to search users..." />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Start typing at least 2 characters to search
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>
          </Form>

          {/* Search Results */}
          <div className="max-h-72 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => onSelectUserToInvite(user)}
                  >
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                    </div>
                    <Button variant="outline" size="sm">Send Invitation</Button>
                  </div>
                ))}
              </div>
            ) : (
              isSearching ? (
                <p className="text-center py-4 text-gray-500">Searching...</p>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  {lookupForm.getValues().query ? "No users found" : "Enter a search term to find users"}
                </p>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}