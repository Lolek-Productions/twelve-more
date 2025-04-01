'use client'

import Comments from '@/components/Comments';
import Post from '@/components/Post';
import AncestorPosts from '@/components/AncestorPosts';
import { HiArrowLeft } from 'react-icons/hi';
import { useEffect, useState } from "react";
import { getPostByIdWithAncestorsAndDescendents } from "@/lib/actions/post.js";
import { useAppUser } from "@/hooks/useAppUser.js";
import { useParams, useRouter } from "next/navigation";
import PostInput from "@/components/PostInput.jsx";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function PostPage() {
  const params = useParams();
  const { postId } = params;
  const { appUser } = useAppUser();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const queryClient = useQueryClient();

  // Set up the React Query for fetching post data (using v5 object syntax)
  const {
    data: postData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await getPostByIdWithAncestorsAndDescendents(postId);
      return response.post;
    },
    enabled: !!postId, // Only run query if postId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Function to handle refreshing post data after a new comment is added
  const afterPostCreated = () => {
    // Invalidate the current post query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['post', postId] });
  };

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      // Fallback destination if there's no history
      router.push(`/communities/${postData?.community?.id}/posts`);
    }
  };

  // Handle error state
  if (error && !isLoading) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-red-500">Error loading post</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

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

      {isLoading && <h2 className='text-center mt-5 text-lg'>Post Loading...</h2>}

      {postData && <AncestorPosts posts={postData.ancestors} clickableText={false} />}
      {postData && <Post post={postData} clickableText={false} />}

      {postData && (
        <PostInput
          communityId={postData.community?.id}
          organizationId={postData.organization.id}
          placeholder={`Respond to this Post by ${postData.user.firstName} ${postData.user.lastName}`}
          parentId={postData.id}
          onPostCreated={afterPostCreated}
          autoFocus={true}
        />
      )}

      {/*Comments*/}
      {postData && <Comments comments={postData.comments} />}
    </>
  );
}