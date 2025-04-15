"use client";

import React, { useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { getUserByIdByAppUser } from "@/lib/actions/user";
import Link from "next/link";
import Post from "@/components/Post.jsx";
import { getPostsByUserForAppUser } from "@/lib/actions/post.js";
import {
  useQuery,
  useInfiniteQuery
} from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import VisibilityLabel from "@/components/VisibilityLabel.jsx";
import {useMainContext} from "@/components/MainContextProvider.jsx";

export default function UserPage() {
  const params = useParams();
  const { userId } = params;
  const { appUser } = useMainContext();
  const observerRef = useRef(null);

  // User data query
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId, appUser?.id],
    queryFn: () => getUserByIdByAppUser(userId, appUser),
    enabled: !!userId && !!appUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch posts with pagination
  const fetchPosts = async ({ pageParam = 0 }) => {
    const limit = 5; //look
    const result = await getPostsByUserForAppUser(userData?.user, limit, appUser, pageParam * limit);
    return {
      posts: result.posts,
      nextPage: result.hasMore ? pageParam + 1 : undefined,
      hasMore: result.hasMore
    };
  };

  // Posts infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorDetails
  } = useInfiniteQuery({
    queryKey: ['userPosts', userId, appUser?.id],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userData?.user && !!appUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Flatten post data from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  // Set up intersection observer for infinite scrolling
  const lastPostRef = useCallback(
    (node) => {
      if (postsLoading || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [postsLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-5 md:w-[30rem]">
      {[...Array(2)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );

  // Loading states
  if (userLoading) return <div className="p-4 md:w-[30rem]">Loading profile...</div>;
  if (userError) return <div className="p-4 text-red-500 w-[30rem]">Error loading profile: {userError.message}</div>;
  if (!userData?.success) return <div className="p-4 text-red-500 w-[30rem]">User not found</div>;

  const user = userData.user;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Profile: {user.firstName} {user.lastName}</h2>
      </div>

      <div className="pt-3 pl-3">
        {user.avatar && (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </div>

      <div className="p-3">
        <h3 className="text-lg font-semibold">Communities ({user.communities.length})</h3>
        {user.communities.length === 0 ? (
          <p className="text-gray-500">No communities yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {user.communities.map((community) => (
              <div key={community.id} className="px-2 rounded-md flex justify-start items-center">
                <Link className="flex gap-3" href={`/communities/${community?.id}/posts`}>
                  <div className="text-sm">{`${community?.name}` || "Unknown"} ({`${community?.organizationName}`})</div>
                  <VisibilityLabel visibility={community?.visibility} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-lg font-semibold">Posts</h3>
      </div>

      {postsLoading ? (
        <LoadingSkeleton />
      ) : postsError ? (
        <div className="p-4 text-red-500">Error loading posts: {postsErrorDetails.message}</div>
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
        <div className="p-4 text-gray-500">No posts found.</div>
      )}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && <LoadingSkeleton />}
    </>
  );
}