'use client';

import {atomPostState, modalState, postIdState} from '../modalState/modalStateDefinition';
import { useAtom } from 'jotai';
import Modal from 'react-modal';
import { HiX } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppUser } from "@/hooks/useAppUser.js";
import { linkifyText } from "@/lib/utils.js";
import { useQueryClient } from '@tanstack/react-query';
import {getPostByIdWithComments} from "@/lib/actions/post.js";
import PostInput from "@/components/PostInput.jsx";

export default function CommentModal() {
  const [open, setOpen] = useAtom(modalState);
  const [postId, setPostId] = useAtom(postIdState);
  const [atomPost, setAtomPost] = useAtom(atomPostState);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState(false);
  const [input, setInput] = useState('');
  const { appUser } = useAppUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) {
      return;
    }

    const fetchComments = async () => {
      if (postId !== '') {
        setCommentsLoading(true);
        setInput('');
        const postResponse = await getPostByIdWithComments(postId);
        // console.log(postResponse);

        if (postResponse.success) {
          setComments(postResponse.post.comments);
          setCommentsLoading(false);
        } else {
          setCommentsLoading(false);
          console.log('Failed to fetch post from CommentModal');
        }
      }
    };
    fetchComments();
  }, [postId]);

  // Function to refresh main page data
  const refreshMainPage = () => {
    // Invalidate and refetch main posts query
    queryClient.invalidateQueries(['post', atomPost.id]);

    // If you have organization-specific queries
    if (atomPost?.organization?.id) {
      queryClient.invalidateQueries(['infiniteOrganizationFeed', atomPost.organization.id]);
    }
    // If you have community-specific queries
    if (atomPost?.community?.id) {
      queryClient.invalidateQueries(['infiniteCommunityFeed', atomPost.community.id]);
    }
  };

  const afterPostCreated = () => {
    setOpen(false);
    refreshMainPage();
  };

  return (
    <div>
      <Modal
        isOpen={open}
        onRequestClose={() => {
          setOpen(false);
          setPostId(null);
        }}
        ariaHideApp={false}
        className="max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-2 border-gray-200 rounded-xl shadow-md z-[80]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-[70]"
      >
        <div className="flex flex-col h-[70vh] max-h-[70vh]">
          <div className="border-b border-gray-200 py-2 px-1.5 flex justify-end shrink-0">
            <HiX
              className="text-3xl text-gray-700 p-1.5 hover:bg-gray-200 rounded-full cursor-pointer"
              onClick={() => {
                setOpen(false);
                setPostId(null);
              }}
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Post Content */}
            <div className="flex items-center space-x-1 relative mb-4">
              <img
                src={
                  atomPost
                    ? 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg'
                    : atomPost?.profileImg
                }
                alt="user-img"
                className="h-11 w-11 rounded-full mr-4"
              />
              <div>
                <h4 className="font-bold sm:text-[16px] text-[15px] hover:underline truncate">
                  {`${atomPost?.user?.firstName} ${atomPost?.user?.lastName}`}
                </h4>
                <h4 className="font-bold text-xs">
                  {atomPost?.organization?.name} - {atomPost?.community?.name}
                </h4>
                <p
                  className="mt-2 text-gray-500 text-[15px] sm:text-[16px] whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
                  style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                  {!atomPost ? 'Loading...' : linkifyText(atomPost?.text)}
                </p>
              </div>
            </div>

            {/* Comment Input */}
            {atomPost && atomPost.id &&
              <PostInput parentId={atomPost.id} organizationId={atomPost.organization.id} placeholder={`Respond to this Post`} communityId={atomPost.community?.id} onPostCreated={() => afterPostCreated()} />
            }

            {/* Comments Section Title */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Comments</h3>
            </div>

            {/* Previous Comments */}
            {commentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
              </div>
            ) : comments?.length > 0 ? (
              <div className="space-y-4 mb-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3 group">
                    <img
                      src={comment.profileImg || 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg'}
                      alt="commenter"
                      className="h-9 w-9 rounded-full"
                    />
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">
                          {comment.name || `${comment.user?.firstName} ${comment.user?.lastName}`}
                        </h4>
                        <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No comments yet. Respond above!
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}