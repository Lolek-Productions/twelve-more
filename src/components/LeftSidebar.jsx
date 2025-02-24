'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiCommandLine } from "react-icons/hi2";
import { HiHome, HiCog, HiOutlineServer, HiCheckCircle, HiOutlinePaperAirplane } from 'react-icons/hi';
import MiniProfile from './MiniProfile';
import CommunityNav from './CommunityNav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { DEV_PHONE_NUMBERS } from '@/lib/constants';

export default function LeftSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const sidebarNavItems = [
    { title: 'Home', href: '/home', icon: <HiHome className="w-6 h-6" /> },
    { title: 'Invite', href: '/invite', icon: <HiOutlinePaperAirplane className="w-6 h-6" /> },
    { title: 'Tasks', href: '/tasks', icon: <HiCheckCircle className="w-6 h-6" /> },
    { title: 'Settings', href: '/settings', icon: <HiCog className="w-6 h-6" /> },
    {
      title: 'Admin',
      href: '/admin',
      icon: <HiOutlineServer className="w-6 h-6" />,
      isVisible: user?.phoneNumbers?.some(phone => DEV_PHONE_NUMBERS.includes(phone.phoneNumber)),
    },
    {
      title: 'Developer',
      href: '/developer',
      icon: <HiCommandLine className="w-6 h-6" />,
      isVisible: user?.phoneNumbers?.some(phone => DEV_PHONE_NUMBERS.includes(phone.phoneNumber)),
    },
  ];

  const visibleNavItems = sidebarNavItems.filter(item =>
    item.isVisible === undefined || item.isVisible === true
  );

  if (!isLoaded || !user) {
    return <div className="p-3">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex flex-col gap-3">
        <Link href="/home" className="flex items-center gap-2 mb-4">
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
            >
              {item.icon}
              {/* Always show title on mobile, hide on xl+ unless needed */}
              <span className="font-bold">{item.title}</span>
            </Link>
          ))}
        </nav>

        <CommunityNav />
      </div>

      <div className="mt-auto">
        <MiniProfile />
      </div>
    </div>
  );
}