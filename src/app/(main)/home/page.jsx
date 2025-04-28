"use client";

import HomeFeed from '@/components/HomeFeed';
import { useEffect, useState } from "react";
import { useRightSidebarContextContent } from "@/components/RightSidebarContextProvider.jsx";
import HomeContextSidebar from "@/components/HomeContextSidebar";
import { getCommunityById } from "@/lib/actions/community.js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addCommunityToUser, addOrganizationToUser } from "@/lib/actions/user.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function HomePage() {
  const { appUser } = useMainContext();
  const router = useRouter();
  const { setRightSidebarContextContent } = useRightSidebarContextContent();
  const [pendingCommunityId, setPendingCommunityId] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  // Set context sidebar
  useEffect(() => {
    setRightSidebarContextContent(<HomeContextSidebar />);
  }, [setRightSidebarContextContent]);

  // Check for pending community invitation
  useEffect(() => {
    const checkForInvitation = async () => {
      if (typeof window !== 'undefined') {
        const storedCommunityId = localStorage.getItem('pendingCommunityJoin');
        if (storedCommunityId) {
          setPendingCommunityId(storedCommunityId);
          try {
            const response = await getCommunityById(storedCommunityId);
            if (response.success) {
              setCommunityData(response.community);
              setShowModal(true);
            } else {
              setError('Could not find any community invitation.');
            }
          } catch (error) {
            console.error('Error fetching community details:', error);
            setError('Error loading community details.');
          }
        }
      }
    };

    checkForInvitation();
  }, []);

  // Part of the onboarding process to join a new community
  const handleJoinCommunity = async () => {
    if (!pendingCommunityId || !communityData || !appUser?.id) {
      setError('Missing required information to join community.');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Add organization and community to user
      await addOrganizationToUser(communityData.organization.id, appUser.id);
      await addCommunityToUser(communityData.id, appUser.id);

      // Clear localStorage
      localStorage.removeItem('pendingCommunityJoin');

      // Close modal
      setShowModal(false);

      // Redirect to the community page
      router.push(`/communities/${communityData.id}/posts`);
    } catch (err) {
      setError(err.message || 'Something went wrong joining the community.');
      console.error('Error joining community:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleDecline = () => {
    localStorage.removeItem('pendingCommunityJoin');
    setShowModal(false);
  };

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          <div>Home</div>
        </h2>
      </div>
      <div>
        {/*<PostInput placeholder={`Share a thought today`}/>*/}
        <HomeFeed/>
      </div>

      {/* Community Invitation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Community Invitation</DialogTitle>
            <DialogDescription>
              {communityData ? (
                <>
                  You've been invited to join <span className="font-semibold">{communityData.name}</span>
                  {communityData.organization?.name && ` in ${communityData.organization.name}`}.
                </>
              ) : (
                'You have a pending community invitation.'
              )}
            </DialogDescription>
          </DialogHeader>

          {communityData?.description && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">"{communityData.description}"</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isJoining}
            >
              Decline
            </Button>
            <Button
              onClick={handleJoinCommunity}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}