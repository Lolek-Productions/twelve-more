import Link from 'next/link';
import moment from 'moment';
import Icons from './Icons';
import { linkifyText } from "@/lib/utils";

export default function Post({ post, clickableText = true }) {
  return (
    <div className="flex p-2 sm:p-3 border-b border-gray-200 w-full hover:bg-gray-50">
      <Link href={`/users/${post?.user?.id}`} className="flex-shrink-0 mr-2">
        <img
          src={post?.profileImg || '/default-avatar.png'}
          alt="user-img"
          className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover flex-shrink-0"
        />
      </Link>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1 min-w-0 max-w-full">
              <h4 className="font-bold text-xs truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                <Link href={`/users/${post?.user?.id}`} className="block truncate">
                  {post?.user?.firstName} {post?.user?.lastName}
                </Link>
              </h4>
              <span className="text-lg text-gray-500 mx-0.5 flex-shrink-0">·</span>
              <span className="text-xs text-gray-500 truncate">
                {moment(post?.createdAt).fromNow()}
              </span>
            </div>
          </div>
          {post?.community?.id && (
            <div className="flex items-center mt-0.5">
              <h4 className="font-bold text-xs truncate max-w-[200px]">
                <Link href={`/communities/${post?.community?.id}`} className="block truncate">
                  {post?.community?.name}
                </Link>
              </h4>
            </div>
          )}
        </div>

        {clickableText ? (
          <Link href={`/posts/${post?.id}`} className="block w-full">
            <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {post?.text || 'No text available'}
            </p>
          </Link>
        ) : (
          <p className="text-gray-800 text-sm mt-1.5 mb-2 whitespace-pre-wrap break-words overflow-hidden hyphens-auto"
             style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
            {linkifyText(post?.text) || 'No text available'}
          </p>
        )}
        {post?.image && (
          <Link href={`/posts/${post?.id}`} className="block">
            <div className="relative w-full overflow-hidden rounded-lg sm:rounded-2xl">
              <img
                src={post?.image}
                className="w-full h-auto object-cover"
                alt="post image"
              />
            </div>
          </Link>
        )}
        {/*{post?.audio && (*/}
        {/*  <div className="w-full py-1">*/}
        {/*    <audio controls src={post?.audio} className="w-full" />*/}
        {/*  </div>*/}
        {/*)}*/}
        <Icons post={post} id={post?.id}/>
      </div>
    </div>
  );
}