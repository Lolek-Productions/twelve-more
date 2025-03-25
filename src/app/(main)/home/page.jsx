"use client";

import HomeFeed from '@/components/HomeFeed';
import PostInput from '@/components/PostInput.jsx';
import { useEffect } from "react";
import { useContextContent } from "@/components/ContextProvider";
import HomeContextSidebar from "@/components/HomeContextSidebar";
import {useAppUser} from "@/hooks/useAppUser.js";

export default function HomePage() {
  const { appUser} = useAppUser();

  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<HomeContextSidebar />);
  }, [setContextContent]);

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          <div>Home</div>
        </h2>
      </div>
      <div>
        {/*<PostInput placeholder={`Share a thought today`}/>*/}
        <HomeFeed/>
      </div>
    </>
  );
}