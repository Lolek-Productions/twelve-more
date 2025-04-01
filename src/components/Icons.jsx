'use client';

import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
  HiHeart,
  HiChat,
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import {atomPostState, modalState, postIdState} from '@/modalState/modalStateDefinition';
import { useAtom } from 'jotai';
import { PiHandsPraying } from "react-icons/pi";
import { useAppUser } from "@/hooks/useAppUser";
import { sayPrayerAction, setUserLikesAction } from "@/lib/actions/post.js";
import { useApiToast } from "@/lib/utils.js";

export default function Icons({ post, commentCount = 0, onCommentClick = null }) {
  const [isLiked, setIsLiked] = useState(false);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [prayers, setPrayers] = useState(post.prayers || []);
  const [open, setOpen] = useAtom(modalState);
  const [postId, setPostId] = useAtom(postIdState);
  const [atomPost, setAtomPost] = useAtom(atomPostState);
  const { appUser } = useAppUser();
  const { showResponseToast, showErrorToast } = useApiToast();

  const likePost = async () => {
    if (!appUser || !post) return;

    try {
      const response = await setUserLikesAction(post, appUser);

      if (response.success) {
        setLikes(response.likes);
        checkUserLikes();
      }

    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const checkUserLikes = () => {
    if (!likes || !appUser) {
      return;
    }

    const appUserId = String(appUser.id);

    const userLikes = likes.some((like) => {
      return like.userId === appUserId;
    });

    setIsLiked(userLikes);
  };

  const sayPrayer = async () => {
    if (!appUser || !post) return;

    try {
      const response = await sayPrayerAction(post, appUser);

      if (response.success) {
        setPrayers(response.prayers);
        checkUserPrayed();
        showResponseToast(response)
      }
    } catch (error) {
      console.error('Failed to add prayer:', error);
      showErrorToast(error)
    }
  };

  useEffect(() => {
    if (!likes || !appUser) { return; }
    checkUserLikes();
  }, [likes, appUser]);

  const checkUserPrayed = () => {
    if (!prayers || !appUser || !appUser.id) {
      console.warn("Skipping checkUserPrayed - Missing data:", { prayers, appUser });
      return;
    }

    const appUserId = String(appUser.id);

    const userHasPrayed = prayers.some((prayer) => {
      return prayer.userId === appUserId;
    });

    setHasPrayed(userHasPrayed);
  };

  useEffect(() => {
    if (!prayers || !appUser) { return; }
    checkUserPrayed();
  }, [prayers, appUser]);

  const deletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (appUser && appUser.id === post.user.id) {
        const res = await fetch('/api/post/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: post.id }),
        });
        if (res.status === 200) {
          location.reload();
        } else {
          alert('Error deleting post');
        }
      }
    }
  };

  // Handler for comment button
  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setOpen(!open);
    setPostId(post.id);
    setAtomPost(post);
  };

  return (
    <div className='flex justify-start gap-5 p-2 text-gray-500'>
      <div className='flex items-center'>
        {showComments ? (
          <HiChat
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-sky-500 hover:bg-sky-100'
            onClick={handleCommentClick}
          />
        ) : (
          <HiOutlineChat
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100'
            onClick={handleCommentClick}
          />
        )}
        <span className={`text-xs ${showComments && 'text-sky-500'}`}>
          {commentCount || post.commentCount || 0}
        </span>
      </div>
      <div className='flex items-center'>
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-red-600 hover:text-red-500 hover:bg-red-100'
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
          />
        )}
        {likes?.length > 0 && (
          <span className={`text-xs ${isLiked && 'text-red-600'}`}>
            {likes?.length}
          </span>
        )}
      </div>

      <div className='flex items-center'>
        {hasPrayed ? (
          <PiHandsPraying
            onClick={sayPrayer}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-green-600 hover:text-green-500 hover:bg-green-100'
          />
        ) : (
          <PiHandsPraying
            onClick={sayPrayer}
            className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-green-500 hover:bg-green-100'
          />
        )}
        {prayers.length > 0 && (
          <span className={`text-xs ${hasPrayed && 'text-green-600'}`}>
            {prayers.length}
          </span>
        )}
      </div>

      {appUser && appUser.id === post.user?.id && (
        <HiOutlineTrash
          onClick={deletePost}
          className='h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
        />
      )}
    </div>
  );
}