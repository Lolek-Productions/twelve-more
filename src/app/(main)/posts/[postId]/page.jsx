'use client'

import Comments from '@/components/Comments';
import Post from '@/components/Post';
import AncestorPosts from '@/components/AncestorPosts';
import { HiArrowLeft } from 'react-icons/hi';
import {useEffect, useState} from "react";
import {getPostByIdWithCommentsAndMetrics, getPostForPostPage} from "@/lib/actions/post.js";
import {useAppUser} from "@/hooks/useAppUser.js";
import {useParams, useRouter} from "next/navigation";
import PostInput from "@/components/PostInput.jsx";


export default function PostPage() {
  const params = useParams();
  const { postId } = params;
  const {appUser} = useAppUser();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState(null);
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (!postId) {
      return;
    }
    const fetchPost = async () => {
      setIsLoading(true);
      // console.log(postId);
      try {
        const postData = await getPostByIdWithCommentsAndMetrics(postId);


        console.log(postData);
        setPost(postData.post);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      // Fallback destination if there's no history
      router.push(`/communities/${post.community.id}/posts`);
    }
  };

  return (
    <>
      <div className='flex items-center space-x-2 py-2 px-3 top-0 z-50 bg-white border-b border-gray-200'>
        <button
          onClick={handleBack}
          className='hover:bg-gray-100 rounded-full p-2'
        >
          <HiArrowLeft className='h-5 w-5'/>
        </button>
        <h2 className='sm:text-lg'>Back</h2>
      </div>

      {!post && isLoading && <h2 className='text-center mt-5 text-lg'>Post Loading...</h2>}


      {post && <AncestorPosts posts={post.ancestors} clickableText={false} />}


      {post && <Post post={post} clickableText={false} />}
      {post && <PostInput communityId={post.community.id} placeholder="Respond to the Post" parentId={post.id}/>}
      {post && <Comments comments={post.comments} />}
    </>
  );
}
