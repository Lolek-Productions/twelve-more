'use client'

import HomeContextSidebar from "@/components/HomeContextSidebar.jsx";
import {useEffect} from "react";
import {useContextContent} from "@/components/ContextProvider.jsx";
import OrganizationList from "@/components/OrganizationList.jsx";

export default function CommunitiesPage() {
  const { setContextContent } = useContextContent();
  useEffect(() => {
    setContextContent(<HomeContextSidebar />);
  }, [setContextContent]);

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          Organizations and their communities
        </h2>
      </div>

      <OrganizationList />
    </>
  )
}