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
import {setSelectedOrganizationOnUser} from "@/lib/actions/user.js";
import { useApiToast } from "@/lib/utils"; // Import your utility

export default function LeftSidebar({ onLinkClick }) {
  const pathname = usePathname();
  const {appUser, isLoaded} = useAppUser();
  const [organizationsOpen, setOrganizationsOpen] = useState(false);
  const { showResponseToast, showErrorToast } = useApiToast();
  const router = useRouter();

  // Wrap Link clicks to close the Sheet
  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Only call if provided (mobile case)
  };

  const handleOrganizationClick = async (organizationId) => {
    try {
      const response = await setSelectedOrganizationOnUser(organizationId, appUser.id);
      showResponseToast(response);
      if (response.success) {
        router.push('/home');
        location.reload();
      }
    } catch (error) {
      showErrorToast(error);
    }
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

  console.log(appUser.selectedOrganization?.welcomingCommunity?.id);

  const WELCOMING_COMMITTEE_ID = appUser.selectedOrganization?.welcomingCommunity?.id;

// Get all communities from the organization without validity filtering
  const orgCommunities = appUser?.communities?.filter(community =>
    community.organizationId === appUser.selectedOrganization.id
  ) || [];

// Sort communities to ensure welcoming committee is first
  const sortedCommunities = orgCommunities.sort((a, b) => {
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

  const communitiesToRender = sortedCommunities.length > 0
    ? sortedCommunities
    : [fallbackLink];

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
                <div className="ml-8 mt-1 space-y-1">
                  {orgsToRender.map((org) => (
                    <Button
                      variant={'ghost'}
                      key={org.id}
                      className={cn(
                        "flex items-center p-1.5 rounded-md transition-all duration-200 gap-2 w-full justify-start",
                        appUser?.selectedOrganization?.id === org.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => handleOrganizationClick(org.id)}
                    >
                      <span className="text-sm">{org.name}</span>
                    </Button>
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

          <div className="p-3 bg-gray-100 rounded-md mt-2">
            <div className="flex items-center">
              <div className="ml-2 text-xl font-semibold mb-1 whitespace-nowrap">My Communities</div>
              <Link href='/communities/create' className='hover:bg-gray-200 rounded-full ml-2 mb-1 p-2'>
                <HiOutlinePlus className='h-5 w-5'/>
              </Link>
            </div>
            <div>
              {communitiesToRender.map((community) => (
                <Link
                  key={community.id}
                  href={community.href || `/communities/${community.id}`}
                  className="flex items-center px-3 py-1 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit"
                  onClick={handleLinkClick}
                >
                  <span className="text-xl mr-2">·</span>
                  <span>{community.name}</span>
                </Link>
              ))}
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