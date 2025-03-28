'use client';
import moment from 'moment';
import Link from 'next/link';
import {HiDotsHorizontal, HiX} from 'react-icons/hi';
import Icons from "@/components/Icons.jsx";
import React, {useEffect, useState} from "react";
import {linkifyText, renderPostText} from "@/lib/utils.js";
import {getPostByIdWithComments} from "@/lib/actions/post.js";

export default function Comment({ comment }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState({});

  useEffect(() => {
    if (!comment.id) {
      return;
    }
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const postData = await getPostByIdWithComments(comment.id);
        // console.log(postData);
        setPost(postData.post);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [comment]);

  // Toggle comments visibility
  const toggleComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <div className='flex p-3 border-b border-gray-200 hover:bg-gray-50 pl-10'>
      <Link href={`/users/${comment?.user?.id || '#'}`}>
        <img
          src={comment?.profileImg}
          alt='user-img'
          className='h-9 w-9 rounded-full mr-4'
        />
      </Link>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-1 whitespace-nowrap'>
              <h4 className='font-bold text-xs truncate max-w-32'>
                {comment?.user?.firstName} {comment?.user?.lastName}
              </h4>
              <span className='text-xl text-gray-500'>·</span>
              <span className='text-xs text-gray-500 flex-1 truncate max-w-32'>
                {moment(comment?.createdAt).fromNow()}
              </span>
            </div>
            {/*<HiDotsHorizontal className='text-sm' />*/}
          </div>
        </div>

        {renderPostText({post: comment, clickableText: false})}

        {post?.image && (
          <div className="relative w-full overflow-hidden rounded-lg sm:rounded-2xl cursor-pointer" onClick={handleImageClick}>
            <img
              src={post?.image}
              className="w-full h-auto object-cover"
              alt="post image"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200"></div>
          </div>
        )}

        <Icons
          post={post}
          id={post?.id}
          commentCount={post?.commentCount || 0}
          onCommentClick={toggleComments}
        />
      </div>

      {/* Full-screen Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeModal}
        >
          <div className="relative max-w-screen-lg mx-auto p-4 w-full">
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-black bg-opacity-60 text-white hover:bg-opacity-80 transition-colors duration-200 z-10"
              onClick={closeModal}
            >
              <HiX className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={post?.image}
                alt="Enlarged post image"
                className="max-h-[90vh] max-w-full object-contain rounded-2xl "
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
