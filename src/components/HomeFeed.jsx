'use client'

import Post from './Post';
import { useEffect, useState } from "react";
import {getPostsForHomeFeed} from "@/lib/actions/post";
import { Skeleton } from "@/components/ui/skeleton"
import {useAppUser} from "@/hooks/useAppUser.js";

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [postNum, setPostNum] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const {appUser} = useAppUser();

  useEffect(() => {
    if (!appUser) {
      setIsLoading(true);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getPostsForHomeFeed(postNum, appUser);
        setPosts(data.posts);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [appUser, postNum]);

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-5 md:w-[30rem]">
      {[...Array(1)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );

  return (
    <div>
      <div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : posts?.length > 0 ? (
          posts.map((post) =>
            post && post.id ? <Post key={post.id} post={post} /> : null
          )
        ) : (
          <div className={'p-5 w-full'}>Get started by inviting someone to your first community!</div>
        )}
      </div>
      <div>
        {posts.length > 0 && !isLoading && hasMore && (
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