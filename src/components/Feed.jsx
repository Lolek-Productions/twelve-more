'use client'

import Post from './Post';
import { useEffect, useState } from "react";
import { getPostsByCommunityId } from "@/lib/actions/post";
import { Skeleton } from "@/components/ui/skeleton"

export default function Feed({ communityId }) {
  const [posts, setPosts] = useState([]); // Stores fetched posts
  const [postNum, setPostNum] = useState(10); // Default number of posts to fetch
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true); // Set loading to true when fetch starts
      try {
        const data = await getPostsByCommunityId({ limit: postNum, communityId });
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false); // Set loading to false when fetch completes (success or fail)
      }
    };

    fetchPosts();
  }, [postNum, communityId]);

  // Skeleton loading component
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-5 w-[30rem]">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );

  return (
    <div>
      <div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : posts.length > 0 ? (
          posts.map((post) =>
            post && post.id ? <Post key={post.id} post={post} /> : null
          )
        ) : (
          <div className={'p-5 w-full'}>Create a post above!</div>
        )}
      </div>
      <div>
        {posts.length > 0 && !isLoading && (
          <button
            onClick={() => setPostNum(postNum + 10)}
            className='text-blue-500 pl-4 pb-6 pt-3 hover:text-blue-700 text-sm'
            disabled={isLoading}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}