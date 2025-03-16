"use client";

import HomeFeed from '@/components/HomeFeed';
import Input from '@/components/Input';
import { useEffect, useCallback } from "react";
import { useContextContent } from "@/components/ContextProvider";
import HomeContextSidebar from "@/components/HomeContextSidebar";
import {useAppUser} from "@/hooks/useAppUser.js";

export default function HomePage() {
  const { setContextContent, clearContextContent } = useContextContent();
  const { appUser} = useAppUser();

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
    <div className="flex w-full justify-center">
      <div className='min-h-screen w-full max-w-xl md:border-r md:border-l border-gray-200'>
        <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
          <h2 className='text-lg sm:text-xl font-bold'>
            {appUser?.selectedOrganization?.id ?
              <>Home: {appUser?.selectedOrganization?.name}</> :
              'Select An Organization'
            }
          </h2>
        </div>
        {appUser?.selectedOrganization?.id &&
          <>
            <Input/>
            <HomeFeed/>
          </>
        }
      </div>
    </div>
  );
}