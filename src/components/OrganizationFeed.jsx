'use client'

import Post from './Post';
import { useRef, useCallback } from "react";
import {getPostsForOrganizationFeed} from "@/lib/actions/post";
import { Skeleton } from "@/components/ui/skeleton"
import { useAppUser } from "@/hooks/useAppUser.js";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function OrganizationFeed({ organizationId }) {
  const { appUser } = useAppUser();
  const observerRef = useRef(null);

  // Set up function to fetch posts with pagination
  const fetchPosts = async ({ pageParam = 0 }) => {
    const limit = 10;
    // Calculate the offset by multiplying the page number by the limit
    const offset = pageParam * limit;

    // Check if we have the required data
    if (!appUser || !organizationId) {
      return {
        posts: [],
        nextPage: undefined,
        hasMore: false
      };
    }

    const result = await getPostsForOrganizationFeed(limit, appUser, organizationId, offset);

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
    queryKey: ['infiniteOrganizationFeed', organizationId, appUser?.id],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!appUser && !!organizationId,
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

  // Skeleton loading component
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
        ) : posts.length > 0 ? (
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
          <div className={'p-5 w-full'}>Create a post above!</div>
        )}

        {/* Loading indicator for next page */}
        {isFetchingNextPage && <LoadingSkeleton />}
      </div>
    </div>
  );
}