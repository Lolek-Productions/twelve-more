"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getUserById } from "@/lib/actions/user";
import Link from "next/link"
import Post from "@/components/Post.jsx";
import {getPostsByUserId} from "@/lib/actions/post.js";

export default function UserPage() {
  const params = useParams();
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postNum, setPostNum] = useState(10);
  const [hasMore, setHasMore] = useState(false);


  useEffect(() => {
    if (!userId) {
      setError("User ID not provided");
      setLoading(false);
      return;
    }
    async function fetchUserData() {
      try {
        const userData = await getUserById(userId);

        if (!userData.success) {
          setError("User not found");
        } else {
          setUser(userData.user);
        }
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();

  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    async function fetchUserPosts() {
      try {
        const postData = await getPostsByUserId(userId, postNum);
        // console.log(postData);

        if (postData.success) {
          setPosts(postData.posts);
          setHasMore(postData.hasMore);
          // console.log(postData.posts);
        } else {
          // setError("Posts not found");
        }
      } catch (err) {
        // setError("Failed to fetch user posts");
      }
    }
    fetchUserPosts();
  }, [userId]);


  if (loading) return <div className="p-4 md:w-[30rem]">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 w-[30rem]">{error}</div>;

  return (
    <>
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold">Profile: {user.firstName} {user.lastName}</h2>
      </div>
      <div className={'p-6'}>
        <h3 className="text-lg font-semibold">Communities ({user.communities.length})</h3>
        {user.communities.length === 0 ? (
          <p className="text-gray-500">No communities yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {user.communities.map((community) => (
              <div key={community.id} className="px-2 rounded-md flex justify-start items-center">
                <Link href={`/communities/${community?.id}`}>
                  <p className="text-sm">{`${community?.name}` || "Unknown"}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 p-6">
        <h3 className="text-lg font-semibold">Posts</h3>
      </div>
      {posts &&
        posts.map((post) => {
          return <Post key={post.id} post={post}/>;
        })
      }

      {posts.length > 0 && !loading && hasMore && (
        <button
          onClick={() => setPostNum(postNum + 10)}
          className='text-blue-500 pl-4 pb-6 pt-3 hover:text-blue-700 text-sm'
        >
          Load more
        </button>
      )}
    </>
  );
}
