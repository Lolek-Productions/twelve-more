'use client'

import Post from '@/components/Post';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {searchPosts} from "@/lib/actions/post.js";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function SearchPage() {
  const params = useParams();
  const { searchTerm } = params;
  const { appUser } = useMainContext();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    if (!searchTerm || !appUser) {
      return;
    }
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const postData = await searchPosts(searchTerm, appUser);
        console.log(postData);
        setPosts(postData.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [searchTerm, appUser]);

  return (
      <>
        <div className='flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <Link href='/home' className='hover:bg-gray-100 rounded-full p-2'>
            <HiArrowLeft className='h-5 w-5'/>
          </Link>
          <h2 className='sm:text-lg'>Back</h2>
        </div>
        <div className='border-b p-6'>
          <h1 className='text-center text-lg'>
            Search results for &quot;{decodeURIComponent(searchTerm)}&quot;
          </h1>
        </div>
        {posts && posts.length === 0 && (
          <h1 className='text-center pt-6 text-2xl'>No results found</h1>
        )}
        {posts && posts.map((post) => <Post key={post.id} post={post}></Post>)}
      </>
  );
}
