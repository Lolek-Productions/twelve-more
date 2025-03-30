'use client';

import { modalState, postIdState } from '../modalState/modalStateDefinition';
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
  const [post, setPost] = useState({});
  const [postLoading, setPostLoading] = useState(false);
  const [input, setInput] = useState('');
  const { appUser } = useAppUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) {
      setPost({});
      setPostLoading(false);
      return;
    }

    const fetchPost = async () => {
      if (postId !== '') {
        setPostLoading(true);
        setInput('');
        const postResponse = await getPostByIdWithComments(postId);
        // console.log(postResponse);

        if (postResponse.success) {
          setPost(postResponse.post);
          setPostLoading(false);
        } else {
          setPostLoading(false);
          console.log('Failed to fetch post from CommentModal');
        }
      }
    };
    fetchPost();
  }, [postId]);

  const afterPostCreated = () => {
    setOpen(false);
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
                <h4 className="font-bold text-xs">
                  {post?.community?.name}
                </h4>
                <p
                  className="mt-2 text-gray-500 text-[15px] sm:text-[16px] whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
                  style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                  {postLoading ? 'Loading...' : linkifyText(post?.text)}
                </p>
              </div>
            </div>

            {/* Comment Input */}
            {post && post.id &&
              <PostInput parentId={post.id} placeholder={`Respond to this Post`} communityId={post.community.id} onPostCreated={() => afterPostCreated()} />
            }
          </div>
        </div>
      </Modal>
    </div>
  );
}