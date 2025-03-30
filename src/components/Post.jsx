'use client'

import Link from 'next/link';
import moment from 'moment';
import Icons from './Icons';
import {renderPostText, SafeMicrolink} from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

export default function Post({ post, clickableText = true, showComments = false, isAncestor = false }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(showComments);

  // Function to open image modal and prevent navigation to post
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsImageModalOpen(false);
  };

  // Toggle comments visibility
  const toggleComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCommentsOpen(!isCommentsOpen);
  };

  return (
    <>
      <div className={`flex p-2 sm:p-3 border-b border-gray-200 w-full hover:bg-gray-50 ${isAncestor ? 'relative' : ''}`}>

        {/* Ancestor vertical line */}
        {isAncestor && (
          <div className="absolute left-6 sm:left-8 top-14 sm:top-16 bottom-0 w-0.5 bg-gray-300" aria-hidden="true"></div>
        )}

        <div className="flex-shrink-0 mr-2 flex flex-col">
          <Link href={`/users/${post?.user?.id}`} className="block">
            <img
              src={post?.profileImg || '/default-avatar.png'}
              alt="user-img"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0"
            />
          </Link>

          {/* This is the clickable space under the avatar */}
          <Link href={`/posts/${post?.id}`} className="flex-grow" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-1 min-w-0 max-w-full">
                <h4 className="font-bold text-xs truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                  <Link href={`/users/${post?.user?.id}`} className="block truncate">
                    {post?.user?.firstName ?? "empty"} {post?.user?.lastName}
                  </Link>
                </h4>
                <span className="text-lg text-gray-500 mx-0.5 flex-shrink-0">·</span>
                <span className="text-xs text-gray-500 truncate">
                  {moment(post?.createdAt).fromNow()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 -mt-1">
              <div className="flex items-center mt-0.5">
                <h4 className="font-bold text-xs truncate max-w-[200px]">
                  <Link href={`/organizations/${post?.organization?.id}/posts`} className="block truncate">
                    {post?.organization?.name}
                  </Link>
                </h4>
              </div>
              {post?.community?.id && (
                <div className="flex items-center mt-0.5">
                  <h4 className="font-bold text-xs truncate max-w-[200px]">
                    <Link href={`/communities/${post?.community?.id}/posts`} className="block truncate">
                      {post?.community?.name}
                    </Link>
                  </h4>
                </div>
              )}
            </div>
          </div>

          {renderPostText({post: post, clickableText: clickableText})}

          {post?.image && (
            <div className="relative w-full overflow-hidden rounded-lg sm:rounded-2xl cursor-pointer" onClick={handleImageClick}>
              <img
                src={post?.image}
                className="w-full h-auto object-cover"
                alt="post image"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200"></div>
            </div>
          )}

          {/* Updated Icons component to include comment count */}
          <Icons
            post={post}
            id={post?.id}
            commentCount={post.commentsCount}
            onCommentClick={toggleComments}
          />
        </div>
      </div>

      {/* Full-screen Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeModal}
        >
          <div className="relative max-w-screen-lg mx-auto p-4 w-full">
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80 transition-colors duration-200 z-10"
              onClick={closeModal}
            >
              <HiX className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={post?.image}
                alt="Enlarged post image"
                className="max-h-[90vh] max-w-full object-contain rounded-2xl "
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}