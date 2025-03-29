'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiCommandLine } from "react-icons/hi2";
import {HiHome, HiOutlinePlus, HiBriefcase, HiChevronDown, HiChevronRight} from 'react-icons/hi';
import { HiMegaphone } from "react-icons/hi2";
import MiniProfile from './MiniProfile';
import {usePathname} from 'next/navigation';
import { cn } from '@/lib/utils';
import {DEV_IDS} from '@/lib/constants';
import {useAppUser} from "@/hooks/useAppUser.js";
import {Button} from "@/components/ui/button.jsx";
import React, {useState} from "react";

export default function LeftSidebar({ onLinkClick }) {
  const pathname = usePathname();
  const {appUser, isLoaded} = useAppUser();
  const [organizationsOpen, setOrganizationsOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState({});

  // Wrap Link clicks to close the Sheet
  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Only call if provided (mobile case)
  };

  const toggleOrgExpansion = (orgId, event) => {
    event.stopPropagation(); // Prevent triggering organization selection
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  if (isLoaded || !appUser) {
    return <div className="p-3">Loading...</div>;
  }

  const fallbackLink = {
    id: 'join-community',
    name: 'Join a Community',
    href: '/communities/',
  };

  // No longer using selectedOrganization
  const WELCOMING_COMMITTEE_ID = null; // You might want to implement a different way to find welcoming communities

  // Get communities for a specific organization
  const getOrgCommunities = (orgId) => {
    // This is a placeholder - you'll need to adapt this to match your data structure
    // It should filter communities that belong to the specific organization
    const orgCommunities = appUser?.communities?.filter(community =>
      community.organizationId === orgId
    ) || [];

    return orgCommunities.sort((a, b) => {
      // Check if community is the welcoming committee by ID
      const isWelcomingCommitteeA = a.id === WELCOMING_COMMITTEE_ID;
      const isWelcomingCommitteeB = b.id === WELCOMING_COMMITTEE_ID;

      // If a is welcoming committee, it comes first
      if (isWelcomingCommitteeA && !isWelcomingCommitteeB) return -1;
      // If b is welcoming committee, it comes first
      if (!isWelcomingCommitteeA && isWelcomingCommitteeB) return 1;
      // Otherwise maintain original order
      return 0;
    });
  };

  const organizations = appUser?.organizations || [];
  const fallbackOrg = { id: 'create-org', name: 'Create an Organization', href: '/organizations/create' };

  const orgsToRender = organizations.length > 0 ? organizations : [fallbackOrg];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="p-3 pb-0">
        <Link href="/home" className="flex items-center gap-2 mb-4" onClick={handleLinkClick}>
          <Image
            src="/logo.png"
            alt="12More"
            width={45}
            height={45}
            priority
          />
          <div className="font-semibold text-xl">12More</div>
        </Link>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <div className="flex flex-col gap-3">

          {/*Home*/}
          <Link
            href='/home'
            className={cn(
              pathname === '/home' ? 'bg-muted' : 'hover:bg-muted/50',
              'flex items-center p-2 rounded-md transition-all duration-200 gap-2 w-full'
            )}
            onClick={handleLinkClick}
          >
            <HiHome className="w-6 h-6" />
            <span className="font-bold">Home</span>
          </Link>

          {/*Purpose*/}
          <Link
            href='/purpose'
            className={cn(
              pathname === '/purpose' ? 'bg-muted' : 'hover:bg-muted/50',
              'flex items-center p-2 rounded-md transition-all duration-200 gap-2 w-full'
            )}
            onClick={handleLinkClick}
          >
            <HiMegaphone className="w-6 h-6" />
            <span className="font-bold">Purpose</span>
          </Link>

          {/*My 12s*/}
          <div className="p-3 bg-gray-100 rounded-md">
            <div className="flex items-center">
              <div className="ml-2 text-xl font-semibold mb-1 whitespace-nowrap">My 12s</div>
            </div>
            <div>
              {appUser?.communities?.length > 0 ? (
                appUser.communities.map((community) => (
                  <Link
                    key={community.id}
                    href={community.href || `/communities/${community.id}/posts`}
                    className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
                    onClick={handleLinkClick}
                  >
                    <span className="text-xl mr-2">·</span>
                    <span>{community.name}</span>
                  </Link>
                ))
              ) : (
                <Link
                  href={fallbackLink.href}
                  className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
                  onClick={handleLinkClick}
                >
                  <span className="text-xl mr-2">·</span>
                  <span>{fallbackLink.name}</span>
                </Link>
              )}

              <div className="flex justify-center">
                <Button asChild size="small">
                  <Link
                    onClick={handleLinkClick}
                    className={'py-1 px-2'}
                    href={`/organizations/`}
                  >
                    Find a 12
                  </Link>
                </Button>
              </div>

            </div>
          </div>

          {/* Organizations dropdown */}
          <div className="mt-2">
            <div className="flex items-center  justify-between">
              <Link
                href="/organizations/"
                onClick={handleLinkClick}
                className="p-2 flex-1 flex items-center hover:bg-gray-100 rounded-md"
              >
                <HiBriefcase className="w-6 h-6 mr-2" />
                <span className="font-bold">Organizations</span>
              </Link>

              <button
                onClick={() => setOrganizationsOpen(!organizationsOpen)}
                className="p-1 hover:bg-gray-100 rounded-md"
              >
                {organizationsOpen ? (
                  <HiChevronDown className="ml-auto w-5 h-5" />
                ) : (
                  <HiChevronRight className="ml-auto w-5 h-5" />
                )}
              </button>
            </div>

            {organizationsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {orgsToRender.map((org) => (
                  <div key={org.id} className="space-y-1">
                    <div className="flex items-center">
                      <Link
                        variant={'ghost'}
                        href={`/organizations/${org.id}`}
                        onClick={handleLinkClick}
                        className="flex-1 flex items-center p-1.5 rounded-md transition-all duration-200 gap-2 justify-start hover:bg-gray-100"
                      >
                        <span className="text-sm">{org.name}</span>
                      </Link>

                      {/* Expand/collapse button for communities */}
                      <button
                        className="p-1 hover:bg-gray-100 rounded-md"
                        onClick={(e) => toggleOrgExpansion(org.id, e)}
                      >
                        {expandedOrgs[org.id] ? (
                          <HiChevronDown className="w-4 h-4" />
                        ) : (
                          <HiChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Communities for this organization */}
                    {expandedOrgs[org.id] && (
                      <div className="pl-6 space-y-1">
                        {getOrgCommunities(org.id).length > 0 ? (
                          getOrgCommunities(org.id).map(community => (
                            <Link
                              key={community.id}
                              href={community.href || `/communities/${community.id}`}
                              className="flex items-center p-1 hover:bg-gray-100 rounded-md text-sm"
                              onClick={handleLinkClick}
                            >
                              <span className="text-xl mr-1">·</span>
                              <span>{community.name}</span>
                            </Link>
                          ))
                        ) : (
                          <div className="flex items-center p-1 text-gray-500 text-sm">
                            <span>No communities</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <Link
                  href="/organizations/create"
                  className="flex items-center p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                  onClick={handleLinkClick}
                >
                  <HiOutlinePlus className="w-3 h-3 mr-1" />
                  <span className="text-xs">New Organization</span>
                </Link>
              </div>
            )}
          </div>

          { appUser?.id && DEV_IDS.includes(appUser.id) &&
            <Link
              href='/developer'
              className={cn(
                pathname === '/developer' ? 'bg-muted' : 'hover:bg-muted/50',
                'flex items-center p-2 rounded-md transition-all duration-200 gap-2 w-full'
              )}
              onClick={handleLinkClick}
            >
              <HiCommandLine className="w-6 h-6" />
              <span className="font-bold">Developer</span>
            </Link>
          }

        </div>
      </div>

      {/* Fixed footer */}
      <div className="">
        <MiniProfile/>
      </div>
    </div>
  );
}