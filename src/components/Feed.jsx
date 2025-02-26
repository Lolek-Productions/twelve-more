'use client'

import Post from './Post';
import {useEffect, useState} from "react";
import {getPostsByCommunityId} from "@/lib/actions/post";

export default function Feed({communityId}) {
  const [posts, setPosts] = useState([]); // Stores fetched posts
  const [postNum, setPostNum] = useState(10); // Default number of posts to fetch

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPostsByCommunityId({ limit: postNum, communityId });
        // console.log(data);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [postNum, communityId]); // ✅ Re-fetch when postNum or communityId changes

  return (
    <div>
      <div>
        {posts.length > 0 ? (
          posts.map((post) =>
            post && post.id ? <Post key={post.id} post={post} /> : null
          )
        ) : (
          <div className={'p-5 w-full'}>Create a post above!</div> // Gracefully handle empty posts
        )}
      </div>
      <div>
        {posts.length > 0 && (
          <button
            onClick={() => setPostNum(postNum + 10)}
            className='text-blue-500 pl-4 pb-6 pt-3 hover:text-blue-700 text-sm'
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
