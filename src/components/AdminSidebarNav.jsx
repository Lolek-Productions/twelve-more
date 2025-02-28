"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Image from "next/image";

export function AdminSidebarNav({ className, items, onLinkClick, ...props }) {
  const pathname = usePathname();
  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Call only if provided (mobile Sheet case)
  };

  return (
    <div className="flex flex-col gap-3">
      <Link href="/home" onClick={handleLinkClick} className="flex items-center gap-2 mb-4">
        <Image
          src="/logo.png"
          alt="TwelveMore"
          width={45}
          height={45}
          priority
        />
        <div className="font-semibold text-xl">TwelveMore</div>
      </Link>

      <nav
        className={cn(
          "flex flex-col",
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              buttonVariants({variant: "ghost"}),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
      )
      }
