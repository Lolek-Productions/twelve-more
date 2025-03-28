'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import PostInput from './PostInput'; // Your updated PostInput component
import { getCommentsForPost } from '@/lib/actions/comment'; // Import the server action

export default function CommentsSection({ postId, initialCommentCount = 0 }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(initialCommentCount);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load comments using server action
  const loadComments = async (page = 1, append = false) => {
    if (!postId || (!append && isLoading)) return;

    try {
      append ? setLoadingMore(true) : setIsLoading(true);
      setIsError(false);

      const result = await getCommentsForPost(postId, 5, page);

      if (result.success) {
        if (append) {
          setComments(prev => [...prev, ...result.comments]);
        } else {
          setComments(result.comments);
        }
        setTotalComments(result.totalComments);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      } else {
        setIsError(true);
        console.error("Error fetching comments:", result.message);
      }
    } catch (error) {
      setIsError(true);
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments(1);
    }
  }, [isExpanded, postId]);

  // Handle new comment created
  const handleCommentCreated = (newComment) => {
    // Add the new comment to the beginning of the list
    if (newComment) {
      setComments(prev => [newComment, ...prev]);
      setTotalComments(prev => prev + 1);
    } else {
      // If no comment data returned, refresh the comments
      loadComments(1);
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  // Load more comments
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      loadComments(currentPage + 1, true);
    }
  };

  return (
    <div className="comment-section mt-3 border-t border-gray-100 pt-2">
      {/* Comments toggle button */}
      <button
        onClick={toggleComments}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        {isExpanded ? 'Hide comments' : `View ${totalComments} comments`}
      </button>

      {/* Comments display */}
      {isExpanded && (
        <div className="comments-container">
          {/* Comment input */}
          <div className="mb-4">
            <PostInput
              parentId={postId}
              placeholder="Write a comment..."
              onPostCreated={handleCommentCreated}
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading comments...</p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-4">
              <p className="text-red-500">Error loading comments. Please try again.</p>
            </div>
          )}

          {/* Comments list */}
          {!isLoading && comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 pb-3">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.profileImg || '/default-avatar.png'}
                      alt={comment.name || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-medium text-sm">{comment.name}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more button */}
              {currentPage < totalPages && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2 text-sm text-blue-600 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading more...' : 'Load more comments'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}