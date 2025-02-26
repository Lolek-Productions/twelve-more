import Link from 'next/link';
import { HiDotsHorizontal } from 'react-icons/hi';
import moment from 'moment';
import Icons from './Icons';

export default function Post({ post, clickableText = true }) {
  return (
    <div className='flex p-3 border-b border-gray-200 w-full hover:bg-gray-50'>
      {/*<Link href={`/users/${post?.user?.toString()}`} className='flex-shrink-0'>*/}
        <img
          src={post?.profileImg}
          alt='img'
          className='h-11 w-11 rounded-full mr-4 flex-shrink-0'
        />
      {/*</Link>*/}
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-1 whitespace-nowrap'>
            <h4 className='font-bold text-xs truncate max-w-32'>
              {post?.community?.name}
            </h4>
            {/* add dot space here */}
            <span className='text-xl text-gray-500'>·</span>
            <span className='text-xs text-gray-500 flex-1 truncate max-w-32'>
              {moment(post?.createdAt).fromNow()}
            </span>
          </div>
          <HiDotsHorizontal className='text-sm' />
        </div>
        {clickableText ? (
          <Link href={`/posts/${post?.id}`} className="block">
            <p className='text-gray-800 text-sm my-3 w-full break-all'>
              {post?.text}
            </p>
          </Link>
        ) : (
          <p className='text-gray-800 text-sm my-3 w-full break-all'>
            {post?.text}
          </p>
        )}
        <Link href={`/posts/${post?.id}`}>
          <img src={post?.image} className='rounded-2xl mr-2' />
        </Link>
        {post?.audio &&
          <div className="w-full py-1">
            <audio controls src={post?.audio} />
          </div>
        }
        <Icons post={post} id={post.id} />
      </div>
    </div>
  );
}
