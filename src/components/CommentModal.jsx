'use client';

import { modalState, postIdState } from '../modalState/modalStateDefinition';
import { useAtom } from 'jotai';
import Modal from 'react-modal';
import { HiX } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {useAppUser} from "@/hooks/useAppUser.js";

export default function CommentModal() {
  const [open, setOpen] = useAtom(modalState);
  const [postId, setPostId] = useAtom(postIdState);
  const [post, setPost] = useState({});
  const [postLoading, setPostLoading] = useState(false);
  const [input, setInput] = useState('');
  const {appUser} = useAppUser();
  const router = useRouter();

  useEffect(() => {
    if (!postId) {
      setPost({});
      setPostLoading(false);
      return;
    }
    // console.log('found post id in CommentModal');

    const fetchPost = async () => {
      // console.log('trying from Atom', postId);

      if (postId !== '') {
        setPostLoading(true);
        setInput('');
        const response = await fetch('/api/post/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });
        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
          setPostLoading(false);
        } else {
          setPostLoading(false);
          console.log('Failed to fetch post from CommentModal');
        }
      }
    };
    fetchPost();
    return () => {
      setPostLoading(false);
    };
  }, [postId]);

  const sendComment = async () => {
    if (!appUser) {
      return router.push('/sign-in');
    }
    try {
      const res = await fetch('/api/post/comment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          comment: input,
          user: appUser.id,
          profileImg: appUser.avatar,
        }),
      });
      if (res.status === 200) {
        setInput('');
        setOpen(false);
        setPostId(null);
        router.push(`/posts/${postId}`);
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.log('Error sending comment:', error);
    }
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
        className="max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-2 border-gray-200 rounded-xl shadow-md"
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
              {/*<span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />*/}
              <img
                src={
                  postLoading
                    ? 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg'
                    : post?.profileImg
                }
                alt="user-img"
                className="h-11 w-11 rounded-full mr-4"
              />
              <div>
                <h4 className="font-bold sm:text-[16px] text-[15px] hover:underline truncate">
                  {postLoading ? 'Name' : `${post?.user?.firstName} ${post?.user?.lastName}`}
                </h4>
                <p className="text-gray-500 text-[15px] sm:text-[16px]">
                  {postLoading ? 'Loading...' : post?.text}
                </p>
              </div>
            </div>

            {/* Comments Section Title */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Comments</h3>
            </div>

            {/* Previous Comments */}
            {postLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
              </div>
            ) : post?.comments?.length > 0 ? (
              <div className="space-y-4 mb-4">
                {post.comments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
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
                      <p className="text-gray-700 text-sm mt-1">{comment.comment}</p>
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
                No comments yet. Be the first to comment!
              </div>
            )}

            {/* Comment Input */}
            <div className="flex p-3 space-x-3 bg-gray-50 rounded-lg mt-4">
              <img
                src={appUser?.avatar}
                alt="user-img"
                className="h-10 w-10 rounded-full cursor-pointer hover:brightness-95"
              />
              <div className="w-full divide-y divide-gray-200">
                <div>
                <textarea
                  className="w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700 placeholder:text-gray-500 bg-transparent"
                  placeholder="Reply to this..."
                  rows="2"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <div className="flex space-x-1">
                    <button className="text-gray-600 p-1 rounded-full hover:bg-gray-200" title="Add emoji">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="text-gray-600 p-1 rounded-full hover:bg-gray-200" title="Attach image">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    disabled={input.trim() === '' || postLoading}
                    onClick={sendComment}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}