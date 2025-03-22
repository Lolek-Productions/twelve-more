'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiCommandLine } from "react-icons/hi2";
import {HiHome, HiOutlinePlus, HiUserGroup, HiBriefcase, HiChevronDown, HiChevronRight} from 'react-icons/hi';
import MiniProfile from './MiniProfile';
import {usePathname, useRouter} from 'next/navigation';
import { cn } from '@/lib/utils';
import {DEV_IDS} from '@/lib/constants';
import {useAppUser} from "@/hooks/useAppUser.js";
import {Button} from "@/components/ui/button.jsx";
import {useState} from "react";
// No longer need the setSelectedOrganizationOnUser action
import { useApiToast } from "@/lib/utils";

export default function LeftSidebar({ onLinkClick }) {
  const pathname = usePathname();
  const {appUser, isLoaded} = useAppUser();
  const [organizationsOpen, setOrganizationsOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const { showResponseToast, showErrorToast } = useApiToast();
  const router = useRouter();

  // Wrap Link clicks to close the Sheet
  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Only call if provided (mobile case)
  };

  // No longer need to track selected organization
  const handleOrganizationClick = (organizationId) => {
    // Expand/collapse communities for this organization
    toggleOrgExpansion(organizationId, { stopPropagation: () => {} });
  };

  const toggleOrgExpansion = (orgId, event) => {
    event.stopPropagation(); // Prevent triggering organization selection
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  const sidebarNavItems = [
    { title: 'Home', href: '/home', icon: <HiHome className="w-6 h-6" /> },
    { title: 'Communities', href: '/communities', icon: <HiUserGroup className="w-6 h-6" /> },
    // { title: 'Tasks', href: '/tasks', icon: <HiCheckCircle className="w-6 h-6" /> },
    // { title: 'Settings', href: '/settings', icon: <HiCog className="w-6 h-6" /> },
    // { title: 'Admin', href: '/admin', icon: <HiOutlineServer className="w-6 h-6" />, isVisible: user?.phoneNumbers?.some(phone => DEV_PHONE_NUMBERS.includes(phone.phoneNumber)) },
    {
      title: 'Developer',
      href: '/developer',
      icon: <HiCommandLine className="w-6 h-6" />,
      isVisible: appUser?.id && DEV_IDS.includes(appUser.id),
    },
  ];

  const visibleNavItems = sidebarNavItems.filter(item =>
    item.isVisible === undefined || item.isVisible === true);

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

  // Sample organizations data - replace with actual data from appUser
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
            alt="TwelveMore"
            width={45}
            height={45}
            priority
          />
          <div className="font-semibold text-xl">TwelveMore</div>
        </Link>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-3 pt-0">
        <div className="flex flex-col gap-3">
          <nav className="space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  pathname === item.href ? 'bg-muted' : 'hover:bg-muted/50',
                  'flex items-center p-2 rounded-md transition-all duration-200 gap-2 w-full'
                )}
                onClick={handleLinkClick}
              >
                {item.icon}
                <span className="font-bold">{item.title}</span>
              </Link>
            ))}

            {/* Organizations dropdown */}
            <div className="mt-2">
              <button
                onClick={() => setOrganizationsOpen(!organizationsOpen)}
                className="flex items-center p-2 rounded-md w-full hover:bg-muted/50 transition-all duration-200"
              >
                <HiBriefcase className="w-6 h-6 mr-2" />
                <span className="font-bold">Organizations</span>
                {organizationsOpen ? (
                  <HiChevronDown className="ml-auto w-5 h-5" />
                ) : (
                  <HiChevronRight className="ml-auto w-5 h-5" />
                )}
              </button>

              {organizationsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {orgsToRender.map((org) => (
                    <div key={org.id} className="space-y-1">
                      <div className="flex items-center">
                        <Button
                          variant={'ghost'}
                          className="flex-1 flex items-center p-1.5 rounded-md transition-all duration-200 gap-2 justify-start hover:bg-gray-100"
                          onClick={() => handleOrganizationClick(org.id)}
                        >
                          <span className="text-sm">{org.name}</span>
                        </Button>

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
          </nav>

          {/* Optional: Keep the original Communities section or remove it */}
          <div className="p-3 bg-gray-100 rounded-md mt-2">
            <div className="flex items-center">
              <div className="ml-2 text-xl font-semibold mb-1 whitespace-nowrap">My Communities</div>
              <Link href='/communities/create' className='hover:bg-gray-200 rounded-full ml-2 mb-1 p-2'>
                <HiOutlinePlus className='h-5 w-5'/>
              </Link>
            </div>
            <div>
              {appUser?.communities?.length > 0 ? (
                appUser.communities.map((community) => (
                  <Link
                    key={community.id}
                    href={community.href || `/communities/${community.id}`}
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
            </div>
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <div className="">
        <MiniProfile/>
      </div>
    </div>
  );
}