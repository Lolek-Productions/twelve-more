'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import CommentForm from './CommentForm';
import { linkifyText } from '@/lib/utils';

// Function to fetch comments
async function fetchComments(postId, page = 1, limit = 10) {
  try {
    const response = await fetch(
      `/api/posts/${postId}/comments?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, comments: [], totalPages: 0 };
  }
}

export default function CommentsDisplay({ postId, initialComments = [] }) {
  const { user } = useUser();
  const [comments, setComments] = useState(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [totalComments, setTotalComments] = useState(initialComments.length);

  // Fetch comments when the component mounts
  useEffect(() => {
    const loadComments = async () => {
      if (!postId) return;

      setIsLoading(true);
      try {
        const result = await fetchComments(postId);

        if (result.success) {
          setComments(result.comments);
          setTotalComments(result.totalComments);
          setHasMoreComments(page < result.totalPages);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't already have initial comments
    if (initialComments.length === 0) {
      loadComments();
    }
  }, [postId, initialComments.length]);

  // Load more comments
  const handleLoadMore = async () => {
    if (isLoading || !hasMoreComments) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await fetchComments(postId, nextPage);

      if (result.success) {
        setComments(prevComments => [...prevComments, ...result.comments]);
        setPage(nextPage);
        setHasMoreComments(nextPage < result.totalPages);
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new comment
  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
    setTotalComments(prev => prev + 1);
  };

  return (
    <div className="comments-section mt-4">
      <h3 className="text-lg font-semibold mb-4">Comments ({totalComments})</h3>

      {/* Comment form */}
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      {/* Comments list */}
      <div className="mt-6 space-y-4">
        {comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <Link href={`/users/${comment.user}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {comment.profileImg ? (
                        <img
                          src={comment.profileImg}
                          alt={comment.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">{(comment.name || 'User').charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center">
                    <Link href={`/users/${comment.user}`} className="font-medium hover:underline">
                      {comment.name || 'User'}
                    </Link>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {moment(comment.createdAt).fromNow()}
                    </span>
                  </div>

                  <div className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                    {linkifyText(comment.text)}
                  </div>
                </div>
              </div>
            ))}

            {hasMoreComments && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Comments'}
                </button>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="text-center py-6 text-gray-500">Loading comments...</div>
        ) : (
          <div className="text-center py-6 text-gray-500">No comments yet. Be the first to add one!</div>
        )}
      </div>
    </div>
  );
}