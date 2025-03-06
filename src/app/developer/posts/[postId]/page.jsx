"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPostById } from "@/lib/actions/post";
import { Button } from "@/components/ui/button";

export default function PostPage() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { postId } = params;
  const router = useRouter();

  useEffect(() => {
    if (!postId) {
      setError("Post ID not provided");
      setLoading(false);
      return;
    }
    async function fetchPostData() {
      try {
        const postData = await getPostById(postId);

        console.log(postData);

        if (!postData) {
          setError("Post not found");
        } else {
          setPost(postData);
        }
      } catch (err) {
        setError("Failed to fetch post data");
      } finally {
        setLoading(false);
      }
    }
    fetchPostData();
  }, [postId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-2">Text: {post.text}</h1>
      <p className="text-gray-700 mb-4">ID: {post.id}</p>
      {/*<p className="text-gray-700 mb-4">*/}
      {/*  {JSON.stringify(post, null, 2)}*/}
      {/*</p>*/}
      <div className={'flex justify-start items-center mb-4'}>
        <div>
          {post?.profileImg ?
            <img
              src={post?.profileImg}
              alt='img'
              className='h-11 w-11 rounded-full mr-4 flex-shrink-0'
            />
            : ''
          }
        </div>
        <div className="text-gray-500 text-sm mb-4">
          Posted
          by {`${post.user?.firstName} ${post.user?.firstName}` || "Unknown"} on {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="mb-4">
        <div>Post Image URL: {post?.image}</div>
      </div>

        <div className="mb-4">
          <h3 className="text-lg">Organization: {post.organization?.name}</h3>
          <h3 className="text-lg">Community: {post.community?.name}</h3>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Likes ({post.likes.length})</h3>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Comments ({post.comments.length})</h3>
          {post.comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border p-2 rounded-md flex justify-start items-center">
                  <div>
                    {comment.profileImg ?
                      <img
                        src={comment.profileImg}
                        alt='img'
                        className='h-11 w-11 rounded-full mr-4 flex-shrink-0'
                      />
                      : ''
                    }
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold">{`${comment.user?.firstName} ${comment.user?.lastName}` || "Unknown"}</p>
                    <p className="text-gray-700">{comment.comment}</p>
                    <p className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
      );
      }
