'use client'

import Link from 'next/link';
import moment from 'moment';
import Icons from './Icons';
import { linkifyText } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Microlink from '@microlink/react';
import CommentsSection from './CommentsSection'; // Import the new CommentsSection component

// Wrapper for Microlink that handles validation and string props
const SafeMicrolink = ({ url }) => {
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      // Check that URL has both protocol and hostname and doesn't end with a dot
      if (!parsedUrl.protocol || !parsedUrl.hostname ||
        !parsedUrl.hostname.includes('.') ||
        parsedUrl.hostname.endsWith('.')) {
        throw new Error('Invalid URL format');
      }
      setIsValidUrl(true);
    } catch (e) {
      console.warn('Invalid URL:', url);
      setIsValidUrl(false);
    }
  }, [url]);

  // Don't render anything for invalid URLs
  if (!isValidUrl) {
    return null;
  }

  // For valid URLs, render the Microlink component with string props instead of boolean
  return (
    <Microlink
      url={url}
      size="large"
      contrast="false" // Use string instead of boolean
      media={['image', 'logo']}
      autoPlay="false" // Use string instead of boolean
      lazy={true}
      className="rounded-lg overflow-hidden border border-gray-200"
    />
  );
}

export default function Post({ post, clickableText = true, showComments = false }) {
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

  // Function to extract and validate URLs from text
  const extractUrls = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex) || [];

    // Filter out invalid URLs
    return matches.filter(url => {
      try {
        // Check if URL is valid by attempting to create a URL object
        // and checking that it has both protocol and hostname
        const parsedUrl = new URL(url);
        return parsedUrl.protocol && parsedUrl.hostname &&
          // Ensure the hostname has at least one dot and doesn't end with a dot
          parsedUrl.hostname.includes('.') &&
          !parsedUrl.hostname.endsWith('.');
      } catch (e) {
        return false;
      }
    });
  };

  // Function to render the post text with LinkPreviews but keep the rest clickable to the post
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
    const urls = extractUrls(post.text);

    return (
      <div>
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

        {/* Render Microlink components for each URL found in the text */}
        {urls.length > 0 && urls.map((url, index) => (
          <div
            key={`microlink-${index}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 mb-3"
          >
            <SafeMicrolink url={url} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex p-2 sm:p-3 border-b border-gray-200 w-full hover:bg-gray-50">
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

          {/* Updated Icons component to include comment count */}
          <Icons
            post={post}
            id={post?.id}
            commentCount={post?.commentCount || 0}
            onCommentClick={toggleComments}
          />

          {/* Conditionally render the comments section */}
          {isCommentsOpen && (
            <div className="mt-2 border-t pt-3">
              <CommentsSection postId={post.id} />
            </div>
          )}
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