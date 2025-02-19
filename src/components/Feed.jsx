'use client'

import Post from './Post';
import {useEffect, useState} from "react";

export default function Feed() {
  const [posts, setPosts] = useState([]); // Stores fetched posts
  const [postNum, setPostNum] = useState(10); // Default number of posts to fetch

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await fetch(`/api/post/all?limit=${postNum}`, {
          method: 'POST',
          cache: 'no-store',
        });

        if (result.ok) {
          const data = await result.json();
          setPosts(data);
        } else {
          console.warn('Empty response or error:', result.status);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [postNum]); // ✅ Fetch data when `postNum` changes

  return (
    <div>
      <div>
        {posts.length > 0 ? (
          posts.map((post) =>
            post && post._id ? <Post key={post._id} post={post} /> : null
          )
        ) : (
          <div className={'p-5'}>Create a post above!</div> // Gracefully handle empty posts
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
