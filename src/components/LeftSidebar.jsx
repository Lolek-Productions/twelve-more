// components/LeftSidebar.js
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiCommandLine } from "react-icons/hi2";
import { HiHome, HiCog, HiOutlineServer, HiCheckCircle, HiOutlinePaperAirplane } from 'react-icons/hi';
import MiniProfile from './MiniProfile';
import CommunityNav from './CommunityNav'; // Import the new component
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LeftSidebar() {
  const pathname = usePathname();

  const sidebarNavItems = [
    {
      title: 'Home',
      href: '/home',
      icon: <HiHome className="w-6 h-6" />,
    },
    {
      title: 'Invite',
      href: '/invite',
      icon: <HiOutlinePaperAirplane className="w-6 h-6" />,
    },
    {
      title: 'Tasks',
      href: '/tasks',
      icon: <HiCheckCircle className="w-6 h-6" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <HiCog className="w-6 h-6" />,
    },
    {
      title: 'Admin',
      href: '/admin',
      icon: <HiOutlineServer className="w-6 h-6" />,
    },
    {
      title: 'Developer',
      href: '/developer',
      icon: <HiCommandLine className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex flex-col p-3 justify-between h-screen items-center">
      <div className="flex flex-col gap-3 p-3 w-48">
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TwelveMore"
            width={45}
            height={45}
            priority
          />
          <div className="font-semibold text-xl">TwelveMore</div>
        </Link>

        <div className="space-y-1 mt-2">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                pathname === item.href ? 'bg-muted' : 'hover:bg-transparent',
                'flex items-center p-2 hover:bg-gray-200 rounded-full transition-all duration-200 gap-2 w-fit'
              )}
            >
              {item.icon}
              <span className="font-bold hidden xl:inline">{item.title}</span>
            </Link>
          ))}
        </div>

        <CommunityNav /> {/* Replace the communities section */}
      </div>
      <MiniProfile />
    </div>
  );
}