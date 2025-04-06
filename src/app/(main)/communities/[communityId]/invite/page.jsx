'use client';

import React, { useEffect, useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
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
import {PUBLIC_APP_URL} from "@/lib/constants.js";
import {useClipboard} from "@/hooks/useClipboard.js";

const userLookupSchema = z.object({
  query: z
    .string()
    .min(2, { message: "Search term must be at least 2 characters." })
});

const profileFormSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid mobile phone number (e.g., +12345678901)." })
    .min(10, { message: "Mobile Phone Number must be 10 digits." })
    .max(15, { message: "Mobile Phone Number must not exceed 10 digits." }),
});

const defaultValues = {
  phoneNumber: "",
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
  const [isCopied, copyToClipboard] = useClipboard();


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
        <Link href={`/communities/${community?.id}/posts`}>
          <h2 className="text-lg sm:text-xl font-bold">Invite to {community?.name}</h2>
        </Link>
      </div>



      <div className="p-5">
        <div>
          <h3 className="text-lg font-semibold">4 ways to invite to your community</h3>
        </div>

        <div className='py-5 flex justify-start'>
          <div>
            <h3 className="text-lg">1. QR Code to be printed or shared</h3>
            <h3 className="text-xs">Click to open the image so you can save</h3>
            <div className="flex justify-start">
              <Link title="Share this QR code with people so that they can join this group." target="_blank" href={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${PUBLIC_APP_URL}/join/${community?.id}`}>
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${PUBLIC_APP_URL}/join/${community?.id}`}
                  alt="12More"
                  className={'mx-auto py-2'}
                  width={45}
                  height={45}
                  priority
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="pb-5 space-y-2">
          <h3 className="text-lg">2. Link to share</h3>
          <button
            onClick={() => copyToClipboard(`${PUBLIC_APP_URL}/join/${community?.id}/`)}
            title={`${PUBLIC_APP_URL}/join/${community?.id}/`}
            className="px-2 py-1 text-sm text-blue-600 hover:text-gray-600
             bg-gray-100 hover:bg-gray-200 rounded
             flex items-center gap-1 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {isCopied ? 'Copied!' : 'Copy invite url'}
          </button>
        </div>

        <div className="pb-5 pt-3">
          <h3 className="text-lg">3. Search for Current Users</h3>
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

        <div className="pt-5">
          <h3 className="text-lg">4. Invite a New User</h3>
          <div className="border border-gray-200 rounded-md p-4">

          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="phoneNumber"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Mobile Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2025550123"
                        {...field}
                        maxLength={10}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            return; // Allow Enter key
                          }
                          const isNumber = /^[0-9]$/.test(e.key);
                          if (!isNumber) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          const numericText = pastedText.replace(/[^0-9]/g, '');
                          field.onChange(numericText);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 10-digit US mobile phone number (no +1 needed).
                    </FormDescription>
                    <FormMessage/>
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
          </div>

        </div>

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