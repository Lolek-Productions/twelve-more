'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiCommandLine } from "react-icons/hi2";
import { HiHome, HiUserGroup } from 'react-icons/hi';
import MiniProfile from './MiniProfile';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {DEV_IDS} from '@/lib/constants';
import {useAppUser} from "@/hooks/useAppUser.js";

export default function LeftSidebar({ onLinkClick }) {
  const pathname = usePathname();
  const {appUser, isLoaded} = useAppUser();

  // Wrap Link clicks to close the Sheet
  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Only call if provided (mobile case)
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
      isVisible: !!appUser?.phoneNumber && DEV_IDS.includes(appUser.id),
    },
  ];

  const visibleNavItems = sidebarNavItems.filter(item =>
    item.isVisible === undefined || item.isVisible === true);

  // console.log(visibleNavItems.length)
  // console.log(appUser?.phoneNumber, DEV_PHONE_NUMBERS,);

  if (isLoaded || !appUser) {
    return <div className="p-3">Loading...</div>;
  }

  const fallbackLink = {
    id: 'join-community',
    name: 'Join a Community',
    href: '/communities/',
  };

  // Filter communities to only include those with an id, then decide on fallback
  const validCommunities = appUser?.communities?.filter((community) =>
    community.id && typeof community.id === 'string' && community.id.trim() !== ''
  ) || [];

  const communitiesToRender = validCommunities.length > 0
    ? validCommunities
    : [fallbackLink];

  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex flex-col gap-3">
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
        </nav>

        <div className="p-3 bg-gray-100 rounded-md mt-2">
          <div className="flex items-center">
            <div className="ml-2 text-xl font-semibold mb-1">My Communities</div>
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

      <div className="mt-auto">
        <MiniProfile/>
      </div>
    </div>
  );
}