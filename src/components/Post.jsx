'use client'

import Link from 'next/link';
import moment from 'moment';
import Icons from './Icons';
import { linkifyText } from "@/lib/utils";
import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

export default function Post({ post, clickableText = true }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  // Function to render the post text with clickable links but keep the rest clickable to the post
  const renderPostText = () => {
    // If not clickable text, just use the linkifyText utility
    if (!clickableText) {
      return (
        <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
           style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
          {linkifyText(post?.text) || 'No text available'}
        </p>
      );
    }

    // If no text, or no links detected, render as normal clickable text
    if (!post?.text || !post.text.includes('http')) {
      return (
        <Link href={`/posts/${post?.id}`} className="block w-full">
          <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
             style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {post?.text || 'No text available'}
          </p>
        </Link>
      );
    }

    // Extract URLs using a regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = post.text.split(urlRegex);

    return (
      <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
         style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {parts.map((part, index) => {
          // Check if this part is a URL
          if (part.match(urlRegex)) {
            // This is a URL - make it a clickable link that stops propagation
            return (
              <a
                key={index}
                href={part}
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part}
              </a>
            );
          } else {
            // This is regular text - make it clickable to the post
            return (
              <Link
                key={index}
                href={`/posts/${post?.id}`}
                className="inline"
              >
                {part}
              </Link>
            );
          }
        })}
      </p>
    );
  };

  return (
    <>
      <div className="flex p-2 sm:p-3 border-b border-gray-200 w-full hover:bg-gray-50">
        <Link href={`/users/${post?.user?.id}`} className="flex-shrink-0 mr-2">
          <img
            src={post?.profileImg || '/default-avatar.png'}
            alt="user-img"
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0"
          />
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-1 min-w-0 max-w-full">
                <h4 className="font-bold text-xs truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                  <Link href={`/users/${post?.user?.id}`} className="block truncate">
                    {post?.user?.firstName} {post?.user?.lastName}
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
                  <Link href={`/organizations/${post?.organization?.id}`} className="block truncate">
                    {post?.organization?.name}
                  </Link>
                </h4>
              </div>
              {post?.community?.id && (
                <div className="flex items-center mt-0.5">
                  <h4 className="font-bold text-xs truncate max-w-[200px]">
                    <Link href={`/communities/${post?.community?.id}`} className="block truncate">
                      {post?.community?.name}
                    </Link>
                  </h4>
                </div>
              )}
            </div>
          </div>

          {/* Use the custom text rendering function */}
          {renderPostText()}

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
          <Icons post={post} id={post?.id}/>
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