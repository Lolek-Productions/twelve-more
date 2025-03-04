'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RightSidebar() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search/${input}`);
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <>
      <div className='sticky top-0 bg-white py-2'>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Search Posts'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='bg-gray-100 border border-gray-200 rounded-3xl text-sm w-full px-4 py-2'
          />
        </form>
      </div>

      <div className='mt-1 text-gray-700 space-y-3 bg-gray-100 rounded-xl py-2'>
        <h4 className='font-bold text-xl px-4'>Prompt of the Day</h4>
        <a href='#' target='_blank'>
          <div className='flex items-center justify-between px-4 pb-2 space-x-1'>
            <div className='space-y-0.5'>
              <h6 className='text-sm font-bold'>Gratitude</h6>
              <p className='text-xs font-medium text-gray-500'>
                Take a minute to tell your community 5 things you are grateful for.
              </p>
            </div>
          </div>
        </a>
      </div>
    </>
  );
}
