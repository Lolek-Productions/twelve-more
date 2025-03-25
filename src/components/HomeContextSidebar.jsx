'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RecentMembersToOrganization from "@/components/RecentMembersToOrganizations.jsx";

export default function HomeContextSidebar() {
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
    <div  className={'p-3'}>
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
      <RecentMembersToOrganization />
    </div>
  );
}
