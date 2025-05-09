'use client'

import React, { useState } from 'react';
import { HiPencil, HiTrash, HiExclamation, HiDotsHorizontal } from 'react-icons/hi';
import { useMainContext } from "@/components/MainContextProvider.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from 'next/dynamic';

// Dynamically import PlayPostDropdownItems only when needed
const PlayPostDropdownItems = dynamic(
  () => import('./PlayPostDropdownItems.jsx').then(mod => mod.PlayPostDropdownItems),
  { ssr: false, loading: () => <div>Loading translation controls...</div> }
);

export default function HiDotsHorizontalMenu({ post, onDelete }) {
  const [open, setOpen] = useState(false);

  const {
    setShowingPostEditModal,
    setSelectedPostId,
    appUser
  } = useMainContext();

  const isAuthor = post?.user?.id === appUser?.id;


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="p-3 md:p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HiDotsHorizontal className="w-6 h-6 md:w-4 md:h-4 text-gray-500" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48" onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* Play Audio Section */}
        {open && (
          <PlayPostDropdownItems post={post} dropdownOpen={open} onRequestClose={() => setOpen(false)} />
        )}

        {/* Edit Section */}
        {isAuthor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                setSelectedPostId(post.id);
                setShowingPostEditModal(true);
                setOpen(false);
            }}
              className="flex items-center cursor-pointer"
            >
              <HiPencil className="mr-2 w-4 h-4" />
              <span>Edit Post</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}