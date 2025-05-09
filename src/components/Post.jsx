'use client'

import Link from 'next/link';
import moment from 'moment';
import Icons from './Icons';
import React, { useState, useEffect } from 'react';

// Dynamically add Mux Player CDN script on client
if (typeof window !== 'undefined' && !window.__MUX_PLAYER_SCRIPT_ADDED__) {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@mux/mux-player';
  script.async = true;
  document.head.appendChild(script);
  window.__MUX_PLAYER_SCRIPT_ADDED__ = true;
}

import { HiX } from 'react-icons/hi';
import PostText from "@/components/PostText.jsx";
import HorizontalDots from "@/components/HorizontalDots.jsx";
import { SYSTEM_BOT_NAME } from "@/lib/constants";

// MuxPlayerWithLoader: Shows a spinner until <mux-player> is loaded and defined
function MuxPlayerWithLoader({ muxPlaybackId, videoTitle }) {
  const [muxReady, setMuxReady] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    if (window.customElements?.get('mux-player')) {
      setMuxReady(true);
      return;
    }
    let timeout;
    function checkMuxPlayerDefined() {
      if (window.customElements?.get('mux-player')) {
        setMuxReady(true);
      } else {
        timeout = setTimeout(checkMuxPlayerDefined, 100);
      }
    }
    checkMuxPlayerDefined();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="my-3 w-full h-[360px] flex items-center justify-center min-h-[180px]">
      {muxReady ? (
        <mux-player
          playback-id={muxPlaybackId}
          stream-type="on-demand"
          metadata-video-title={videoTitle}
          primary-color="#0099ff"
          accent-color="#005577"
          className="w-full h-full"
          style={{ height: '100%', maxHeight: '360px' }}
          controls
        ></mux-player>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[180px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <span className="text-gray-500 text-sm">Loading video player…</span>
        </div>
      )}
    </div>
  );
}

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

  // Handle post deletion
  const handleDeletePost = (postId) => {
    // Implement delete functionality here
    console.log('Delete post:', postId);
    // You could call an API here to delete the post
  };

  return (
    <>
      <div className={`flex p-2 sm:p-3 border-b border-gray-200 w-full hover:bg-gray-50 ${isAncestor ? 'relative' : ''}`}>
        {/* Ancestor vertical line */}
        {isAncestor && (
          <div className="absolute left-6 sm:left-8 top-14 sm:top-16 bottom-0 w-0.5 bg-gray-300" aria-hidden="true"></div>
        )}

        <div className="flex-shrink-0 mr-2 flex flex-col">

        {post?.user?.id ? (
          <Link href={`/users/${post?.user?.id}`} className="block">
            <img
              src={post?.profileImg}
              alt="User Image"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0"
            />
          </Link>
        ) : (
          <div className="block">
            <img
              src={'/logo.png'}
              alt="12more logo"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0"
            />
          </div>
        )}

          {/* This is the clickable space under the avatar */}
          <Link href={`/posts/${post?.id}`} className="flex-grow" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-1 min-w-0 max-w-full">
                <h4 className="font-bold text-xs truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                {post?.user?.id ? (
                  <Link href={`/users/${post?.user?.id}`} className="block truncate">
                    {post?.user?.firstName ?? "empty"} {post?.user?.lastName}
                  </Link>
                ) : (
                  <div className="block truncate">
                    {SYSTEM_BOT_NAME}
                  </div>
                )}
                </h4>
                <span className="text-lg text-gray-500 mx-0.5 flex-shrink-0">·</span>
                <span className="text-xs text-gray-500 truncate">
                  {moment(post?.createdAt).fromNow()}
                </span>
              </div>

              <HorizontalDots post={post} onDelete={handleDeletePost} />
            </div>

            <div className="flex items-center gap-2 -mt-1">
              <div className="flex items-center mt-0.5">
                <h4 className="font-bold text-xs truncate max-w-[200px]">
                  <Link href={`/organizations/${post?.organization?.id}/posts`} className="block truncate" title={post?.organization?.name}>
                    {post?.organization?.name}
                  </Link>
                </h4>
              </div>
              {post?.community?.id && (
                <div className="flex items-center mt-0.5">
                  <h4 className="font-bold text-xs truncate max-w-[200px]" title={post?.community?.name}>
                    <Link href={`/communities/${post?.community?.id}/posts`} className="block truncate">
                      {post?.community?.name}
                    </Link>
                  </h4>
                </div>
              )}
            </div>
          </div>

          <PostText post={post} clickableText={clickableText} />

          {post?.muxUploadId && !post?.muxPlaybackId ? (
            <div className="my-3 flex flex-col items-center justify-center min-h-[100px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <span className="text-blue-600 text-sm">Processing your video…</span>
              <span className="text-gray-500 text-xs mt-1">It may take a minute for your video to be playable.</span>
            </div>
          ) : post?.muxPlaybackId ? (
            <MuxPlayerWithLoader muxPlaybackId={post.muxPlaybackId} videoTitle={post.text || 'Video'} />
          ) : null}

          {/* Audio playback if audio is present */}
          {post?.audio && (
            <div className="my-3">
              <audio
                controls
                src={post.audio}
                className="w-full rounded-lg"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

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
          <div className="relative max-w-screen-lg mx-auto p-4 w-full flex items-center justify-center">
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80 transition-colors duration-200 z-10"
              onClick={closeModal}
            >
              <HiX className="w-4 h-4" />
            </button>

            <img
              src={post?.image}
              alt="Enlarged post image"
              className="max-h-[90vh] max-w-full object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}