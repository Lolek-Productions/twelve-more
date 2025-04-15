"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Image from "next/image"
import { ChevronDown, ChevronRight } from "lucide-react"

export function AdminSidebarNav({ className, items, onLinkClick, ...props }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick(); // Call only if provided (mobile Sheet case)
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      <Link href="/home" onClick={handleLinkClick} className="flex items-center gap-2 mb-4">
        <Image
          src="/logo.png"
          alt="12More"
          width={45}
          height={45}
          priority
        />
        <div className="font-semibold text-xl">12More</div>
      </Link>
      <nav
        className={cn(
          "flex flex-col w-full space-y-1",
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <div key={item.title || item.href} className="w-full">
            {item.children ? (
              <SubMenu
                item={item}
                pathname={pathname}
                onLinkClick={handleLinkClick}
              />
            ) : (
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  buttonVariants({variant: "ghost"}),
                  pathname === item.href
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start w-full"
                )}
              >
                {item.title}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

// SubMenu component to handle collapsible sections
function SubMenu({ item, pathname, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(
    // Auto-expand if any child is active
    item.children.some(child => pathname === child.href)
  );

  const toggleSubmenu = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={toggleSubmenu}
        className={cn(
          buttonVariants({variant: "ghost"}),
          "w-full justify-between group"
        )}
      >
        <span>{item.title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="ml-4 border-l pl-2 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onLinkClick}
              className={cn(
                buttonVariants({variant: "ghost"}),
                pathname === child.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start block"
              )}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}