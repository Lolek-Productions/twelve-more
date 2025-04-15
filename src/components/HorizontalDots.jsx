'use client'

import { useState } from 'react';
import { HiPencil, HiTrash, HiExclamation, HiDotsHorizontal } from 'react-icons/hi';
import { useMainContext } from "@/components/MainContextProvider.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HiDotsHorizontalMenu({ post, onDelete }) {
  const [open, setOpen] = useState(false);

  const {
    setShowingPostEditModal,
    setSelectedPostId,
    appUser
  } = useMainContext();

  // Check if current user is the post author
  const isAuthor = post?.user?.id === appUser?.id;

  return (
    <>
    {isAuthor && (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HiDotsHorizontal className="w-3 h-3 text-gray-500" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48" onCloseAutoFocus={(e) => e.preventDefault()}>

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

          {/*<DropdownMenuItem*/}
          {/*  onSelect={() => {*/}
          {/*    if (onDelete && typeof onDelete === 'function') {*/}
          {/*      onDelete(post.id);*/}
          {/*    }*/}
          {/*    setOpen(false);*/}
          {/*  }}*/}
          {/*  className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"*/}
          {/*>*/}
          {/*  <HiTrash className="mr-2 w-4 h-4" />*/}
          {/*  <span>Delete Post</span>*/}
          {/*</DropdownMenuItem>*/}

          {/*<DropdownMenuSeparator />*/}

          {/*<DropdownMenuItem*/}
          {/*  onSelect={() => {*/}
          {/*    alert('Report functionality to be implemented');*/}
          {/*    setOpen(false);*/}
          {/*  }}*/}
          {/*  className="flex items-center cursor-pointer"*/}
          {/*>*/}
          {/*  <HiExclamation className="mr-2 w-4 h-4" />*/}
          {/*  <span>Report Post</span>*/}
          {/*</DropdownMenuItem>*/}
        </DropdownMenuContent>
      </DropdownMenu>
      )}
      </>
  );
}