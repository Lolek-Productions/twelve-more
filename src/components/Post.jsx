import Link from 'next/link';
import { HiDotsHorizontal } from 'react-icons/hi';
import moment from 'moment';
import Icons from './Icons';
import {linkifyText} from "@/lib/utils";

export default function Post({ post, clickableText = true }) {
  return (
    <div className="flex p-3 border-b border-gray-200 w-full hover:bg-gray-50">
      <Link href={`/users/${post?.user?.id}`} className="flex-shrink-0">
        <img
          src={post?.profileImg || '/default-avatar.png'}
          alt="user-img"
          className="h-11 w-11 rounded-full mr-4 flex-shrink-0"
        />
      </Link>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-xs truncate max-w-32">
              <Link href={`/users/${post?.user?.id}`} className="flex-shrink-0">
                {post?.user?.firstName} {post?.user?.lastName}
              </Link>
            </h4>
            <span className="text-xl text-gray-500">·</span>
            {post?.community?.id && (
              <div className={'hidden sm:flex items-center'}>
                <h4 className="font-bold text-xs truncate max-w-32">
                  <Link href={`/communities/${post?.community?.id}`} className="flex-shrink-0">
                    {post?.community?.name}
                  </Link>
                </h4>
                <span className="text-xl text-gray-500">·</span>
              </div>
            )}
            <span className="text-xs text-gray-500 flex-1 truncate max-w-32">
              {moment(post?.createdAt).fromNow()}
            </span>
          </div>
        </div>
        {clickableText ? (
          <Link href={`/posts/${post?.id}`} className="block">
            <p className="text-gray-800 text-sm my-3 max-w-full break-words overflow-hidden">
              {post?.text || 'No text available'}
            </p>
          </Link>
        ) : (
          <p className="text-gray-800 text-sm my-3 max-w-full break-words overflow-hidden">
            {linkifyText(post?.text) || 'No text available'}
          </p>
        )}
        {post?.image && (
          <Link href={`/posts/${post?.id}`}>
            <img src={post?.image} className="rounded-2xl mr-2 max-w-full h-auto" alt="post image" />
          </Link>
        )}
        {/*{post?.audio && (*/}
        {/*  <div className="w-full py-1">*/}
        {/*    <audio controls src={post?.audio} className="w-full" />*/}
        {/*  </div>*/}
        {/*)}*/}
        <Icons post={post} id={post?.id} />
      </div>
    </div>
  );
}