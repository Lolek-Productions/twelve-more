"use client";

import HomeFeed from '@/components/HomeFeed';
import SelectedOrganizationName from "@/components/SelectedOrganizationName.jsx";
import Input from '@/components/Input';
import { useEffect, useCallback } from "react";
import { useContextContent } from "@/components/ContextProvider";
import HomeContextSidebar from "@/components/HomeContextSidebar";

export default function HomePage() {
  const { setContextContent, clearContextContent } = useContextContent();

  // Create a stable onClose callback that won't change on re-renders
  const handleClose = useCallback(() => {
    clearContextContent();
  }, [clearContextContent]);

  useEffect(() => {
    // Create the context component once when the component mounts
    const ContextComponent = <HomeContextSidebar onClose={handleClose} />;
    setContextContent(ContextComponent);

    // Clean up when the component unmounts
    return () => {
      clearContextContent();
    };
  }, [setContextContent, handleClose]);

  return (
    <div className="flex w-full">
      <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>Home: <SelectedOrganizationName/></h2>
        </div>
        <Input/>
        <HomeFeed/>
      </div>
    </div>
  );
}