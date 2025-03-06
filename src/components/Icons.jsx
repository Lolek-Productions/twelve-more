'use client';

import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
  HiHeart,
} from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { modalState, postIdState } from '@/modalState/modalStateDefinition';
import { useAtom } from 'jotai';
import { PiHandsPraying } from "react-icons/pi";
import {useAppUser} from "@/hooks/useAppUser";
import {sayPrayerAction, setUserLikesAction} from "@/lib/actions/post.js";

export default function Icons({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [prayers, setPrayers] = useState(post.prayers || []);
  const [open, setOpen] = useAtom(modalState);
  const [postId, setPostId] = useAtom(postIdState);
  const router = useRouter();
  const {appUser} = useAppUser();

  const likePost = async () => {
    if (!appUser || !post) return;

    try {
      const response = await setUserLikesAction(post, appUser);

      if(response.success) {
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

      if(response.success) {
        setPrayers(response.prayers);
        checkUserPrayed();
      }

    } catch (error) {
      console.error('Failed to add prayer:', error);
    }
  };


  useEffect(() => {
    if(!likes || !appUser) { return; }
    checkUserLikes();
  }, [likes, appUser]);


  const checkUserPrayed = () => {
    if (!prayers || !appUser || !appUser.id) {
      console.warn("Skipping checkUserPrayed - Missing data:", { prayers, appUser });
      return;
    }

    const appUserId = String(appUser.id);

    const userHasPrayed = prayers.some((prayer) => {
      // console.log("Inside .some() loop - appUserId (captured):", appUserId);
      return prayer.userId === appUserId;
    });

    // console.log('userHasPrayed', userHasPrayed);
    setHasPrayed(userHasPrayed);
  };

  useEffect(() => {
    if(!prayers || !appUser) { return; }
    // console.log('post.prayers', post.prayers);
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

  return (
    <div className='flex justify-start gap-5 p-2 text-gray-500'>
      <div className='flex items-center'>
        <HiOutlineChat
          className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100'
          onClick={() => {
            if (!appUser) {
              router.push('/sign-in');
            } else {
              setOpen(!open);
              setPostId(post.id);
            }
          }}
        />
        {post.comments?.length > 0 && (
          <span className='text-xs'>{post.comments.length}</span>
        )}
      </div>
      <div className='flex items-center'>
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 text-red-600 hover:text-red-500 hover:bg-red-100'
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
          />
        )}
        {likes.length > 0 && (
          <span className={`text-xs ${isLiked && 'text-red-600'}`}>
            {likes.length}
          </span>
        )}
      </div>

      <div className='flex items-center'>
        {hasPrayed ? (
          <PiHandsPraying
            onClick={sayPrayer}
            className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 text-green-600 hover:text-green-500 hover:bg-green-100'
          />
        ) : (
          <PiHandsPraying
            onClick={sayPrayer}
            className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 hover:text-green-500 hover:bg-green-100'
          />
        )}
        {prayers.length > 0 && (
          <span className={`text-xs ${hasPrayed && 'text-green-600'}`}>
            {prayers.length}
          </span>
        )}
      </div>

      {appUser && appUser.id === post.user.id && (
        <HiOutlineTrash
          onClick={deletePost}
          className='h-8 w-8 cursor-pointer rounded-full  transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100'
        />
      )}
    </div>
  );
}
