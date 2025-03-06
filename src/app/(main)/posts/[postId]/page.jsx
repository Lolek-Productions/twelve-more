'use client'

import Comments from '@/components/Comments';
import Post from '@/components/Post';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import RightSidebar from "@/components/RightSidebar";
import {useEffect, useState} from "react";
import {getPostById, getPosts} from "@/lib/actions/post.js";
import {useAppUser} from "@/hooks/useAppUser.js";
import {useParams} from "next/navigation";


export default function PostPage() {
  const params = useParams();
  const { postId } = params;
  const {appUser} = useAppUser();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!postId) {
      return;
    }
    const fetchPost = async () => {
      setIsLoading(true);
      // console.log(postId);
      try {
        const postData = await getPostById(postId);
        // console.log(postData);
        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>

        <div
          className='md:w-[30rem] flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <Link href='/home' className='hover:bg-gray-100 rounded-full p-2'>
            <HiArrowLeft className='h-5 w-5'/>
          </Link>
          <h2 className='sm:text-lg'>Back</h2>
        </div>

        {!post && isLoading && <h2 className='text-center mt-5 text-lg'>Post Loading...</h2>}
        {post && <Post post={post} clickableText={false} />}
        {post && <Comments comments={post.comments} />}
      </div>

      <div className="hidden lg:flex lg:flex-col p-3 h-screen border-l w-[24rem] flex-shrink-0">
        <RightSidebar/>
      </div>
    </div>
  );
}
