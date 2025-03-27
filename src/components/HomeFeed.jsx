'use client'

import Post from './Post';
import { useEffect, useRef, useCallback } from "react";
import { getPostsForHomeFeed } from "@/lib/actions/post";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppUser } from "@/hooks/useAppUser.js";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function HomeFeed() {
  const { appUser } = useAppUser();
  const observerRef = useRef(null);

  // Modify your getPostsForHomeFeed to work with pageParam
  const fetchPosts = async ({ pageParam = 0 }) => {
    const limit = 10;
    const result = await getPostsForHomeFeed(limit, appUser, pageParam * limit);
    return {
      posts: result.posts,
      nextPage: result.hasMore ? pageParam + 1 : undefined,
      hasMore: result.hasMore
    };
  };

  // Set up infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['infiniteHomeFeed', appUser?.id],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!appUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten post data from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  // Set up intersection observer for infinite scrolling
  const lastPostRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-5 md:w-[30rem]">
      {[...Array(1)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );

  // Handle error state
  if (isError) {
    return <div className="p-5">Error loading posts: {error.message}</div>;
  }

  return (
    <div>
      <div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : posts?.length > 0 ? (
          posts.map((post, index) => {
            // Apply ref to last post for infinite scrolling
            if (index === posts.length - 1) {
              return post && post.id ? (
                <div key={post.id} ref={lastPostRef}>
                  <Post post={post} />
                </div>
              ) : null;
            }

            return post && post.id ? <Post key={post.id} post={post} /> : null;
          })
        ) : (
          <div className={'p-5 w-full'}>Get started by inviting someone to your first community!</div>
        )}

        {/* Loading indicator for next page */}
        {isFetchingNextPage && <LoadingSkeleton />}
      </div>
    </div>
  );
}